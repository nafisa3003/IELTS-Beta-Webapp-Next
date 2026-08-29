import os
import json
import time
import sqlite3
from typing import TypedDict, Annotated, Optional
from dotenv import load_dotenv
load_dotenv()

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults as TavilySearch

from band_predictor import BandPredictor

# Loaded once at import time (not per-request) — local scikit-learn model,
# no network call. If the model files are missing, grading still works;
# the ML second opinion is just silently skipped.
try:
    _band_predictor = BandPredictor()
except Exception as e:
    print(f"DEBUG: ML band predictor unavailable ({e}) — grading will run without a second opinion")
    _band_predictor = None


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    intent: str
    grading_result: Optional[dict]


# ---- Config ----
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "12"))
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", str(24 * 3600)))
CACHE_FILE = "response_cache.json"
KB_FILE = "knowledge_base.json"

# Original rubric text is Claude's own paraphrase of general IELTS Writing Task 2
# assessment criteria for tutoring purposes — NOT the official IELTS/British
# Council band descriptor document, which is copyrighted. Good enough to steer
# an LLM's grading; not a substitute for official materials in a real product.
DEFAULT_KB = {
    "task1_rubric": {
        "task_achievement": (
            "Academic report: Band 9: covers all key features/stages/trends with fully "
            "accurate, well-supported data and a clear, well-placed overview. Band 7: covers "
            "key features with generally accurate data and a clear overview, some minor "
            "omissions. Band 5: covers some features but the overview is unclear or missing, "
            "data may be inaccurate or irrelevant.\n"
            "General Training letter: Band 9: fully addresses the purpose, tone entirely "
            "appropriate to the situation and recipient. Band 7: addresses the purpose "
            "clearly, tone generally appropriate. Band 5: purpose only partly addressed, tone "
            "inconsistent or not well suited to the situation."
        ),
    },
    "task2_rubric": {
        "task_response": (
            "Band 9: fully addresses every part of the prompt with a clear, well-developed "
            "position and fully extended, relevant ideas. Band 7: addresses all parts, clear "
            "position throughout, main ideas extended but not always fully. Band 5: only "
            "partially addresses the prompt, position unclear or inconsistent, limited idea "
            "development."
        ),
    },
    "shared_writing_criteria": {
        "coherence_cohesion": (
            "Band 9: skillfully organized with natural, well-managed paragraphing. Band 7: "
            "logically organized with clear overall progression, cohesive devices used well "
            "though occasionally over- or under-used. Band 5: some organization present but "
            "no clear overall progression, cohesive devices used mechanically or inaccurately."
        ),
        "lexical_resource": (
            "Band 9: wide vocabulary range used naturally and precisely, only rare minor "
            "errors. Band 7: sufficient range with some flexibility and precision, occasional "
            "inaccuracies. Band 5: limited range with noticeable errors that may distract the "
            "reader."
        ),
        "grammatical_range_accuracy": (
            "Band 9: wide range of structures with full flexibility and accuracy, only rare "
            "slips. Band 7: a variety of complex structures with good control, frequent "
            "error-free sentences. Band 5: limited structure range, frequent grammar errors "
            "that can impede communication."
        ),
    },
    "speaking_part2": "Structure answers with a clear intro, 3-4 supporting points, and a wrap-up. Aim to speak for the full 1-2 minutes without long pauses.",
    "logistics_topics": ["test dates", "fees", "one skill retake", "academic vs general IELTS", "registration"],
}


def load_knowledge_base() -> dict:
    try:
        with open(KB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_KB


def retrieve_context(kb: dict, intent: str) -> str:
    """Pull only the KB section relevant to the classified intent, instead of
    dumping the entire knowledge base into every system prompt."""
    if intent == "GRADING":
        combined = {
            "task1_rubric": kb.get("task1_rubric", {}),
            "task2_rubric": kb.get("task2_rubric", {}),
            "shared_writing_criteria": kb.get("shared_writing_criteria", {}),
        }
        return json.dumps(combined, indent=2)
    if intent == "SPEAKING":
        return str(kb.get("speaking_part2", ""))
    if intent == "LOGISTICS":
        return "Relevant topics: " + ", ".join(kb.get("logistics_topics", []))
    return ""  # VOCAB / GENERAL don't need KB grounding


class ResponseCache:
    def __init__(self, path: str = CACHE_FILE, ttl: int = CACHE_TTL_SECONDS):
        self.path = path
        self.ttl = ttl
        self._data: dict[str, dict] = self._load()

    def _load(self) -> dict:
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save(self):
        try:
            with open(self.path, "w", encoding="utf-8") as f:
                json.dump(self._data, f)
        except Exception:
            pass

    @staticmethod
    def _key(text: str) -> str:
        return " ".join(text.strip().lower().split())

    def get(self, text: str) -> str | None:
        entry = self._data.get(self._key(text))
        if not entry or time.time() - entry["ts"] > self.ttl:
            return None
        return entry["reply"]

    def set(self, text: str, reply: str):
        self._data[self._key(text)] = {"reply": reply, "ts": time.time()}
        self._save()


# ---- Lightweight intent classification (heuristic first, LLM fallback) ----
_GRADING_HINTS = ["grade my essay", "feedback on my writing", "check my essay", "mark my essay"]
_VOCAB_HINTS = ["vocabulary", "vocab", "synonym", "word for"]
_SPEAKING_HINTS = ["speaking part", "cue card", "fluency"]
_LOGISTICS_HINTS = ["test date", "fee", "book my test", "one skill retake", "academic vs general", "registration"]


def heuristic_intent(text: str) -> str | None:
    t = text.lower()
    if len(text.split()) > 100 or any(k in t for k in _GRADING_HINTS):
        return "GRADING"
    if any(k in t for k in _VOCAB_HINTS):
        return "VOCAB"
    if any(k in t for k in _SPEAKING_HINTS):
        return "SPEAKING"
    if any(k in t for k in _LOGISTICS_HINTS):
        return "LOGISTICS"
    return None


GRADING_SCHEMA_HINT = """First decide the task type from the text itself (a Task 1 report
describes a chart/graph/table/diagram/map; a Task 1 General Training piece is a letter,
usually opening "Dear ..."; a Task 2 piece is a discursive essay with an
introduction/body/conclusion responding to an opinion or argument prompt, usually 250+ words).

Return ONLY a JSON object with this exact shape, no other text:
{
  "task_type": "Task 1 (Academic)" | "Task 1 (General Training)" | "Task 2",
  "content_criterion_name": "Task Achievement" | "Task Response",
  "content_criterion": {"score": <0-9>, "comment": "<one or two sentences>"},
  "coherence_cohesion": {"score": <0-9>, "comment": "<one or two sentences>"},
  "lexical_resource": {"score": <0-9>, "comment": "<one or two sentences>"},
  "grammatical_range_accuracy": {"score": <0-9>, "comment": "<one or two sentences>"},
  "overall_band": <0-9, average of the four criteria rounded to nearest 0.5>,
  "improvements": [
    {"location": "<e.g. 'Introduction', 'Paragraph 2', 'Conclusion'>",
     "issue": "<what's weak there, quoting a short phrase from the essay if useful>",
     "suggestion": "<a concrete, specific fix — not generic advice>"}
    ... 3 to 5 of these, ordered by impact on the score ...
  ],
  "summary": "<2-3 sentence overall summary, teacher-to-student tone>"
}
Use "Task Achievement" as content_criterion_name for Task 1 (either variant), "Task Response"
for Task 2. Base content_criterion on the matching rubric section (task1_rubric or
task2_rubric); base the other three criteria on shared_writing_criteria in both cases."""


class IELTSGraphEngine:
    def __init__(self):
        keys_env = os.getenv("GROQ_API_KEYS") or os.getenv("GROQ_API_KEY", "")
        self._groq_keys = [k.strip() for k in keys_env.split(",") if k.strip()]
        if not self._groq_keys:
            raise RuntimeError("No Groq API key(s) found — set GROQ_API_KEY or GROQ_API_KEYS in .env")
        self._key_index = 0
        self._model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

        self.tavily = TavilySearch(api_key=os.getenv("TAVILY_API_KEY"))
        self.tools = [self.tavily]

        self._build_llm()

        self.kb = load_knowledge_base()
        self.cache = ResponseCache()

        self.db_conn = sqlite3.connect("checkpoint.db", check_same_thread=False)
        self.memory = SqliteSaver(self.db_conn)

        self.graph = self._build_graph()

    # ---- Multi-key rotation ----
    def _build_llm(self):
        key = self._groq_keys[self._key_index]
        self.llm = ChatGroq(api_key=key, model=self._model)
        self.llm_with_tools = self.llm.bind_tools(self.tools)
        # Separate handle for structured (JSON-mode) calls — grading/critique
        # don't need tool-calling, and mixing bind_tools + response_format
        # is unreliable across providers.
        self.llm_json = self.llm.bind(response_format={"type": "json_object"})

    def _rotate_key(self):
        self._key_index = (self._key_index + 1) % len(self._groq_keys)
        print(f"DEBUG: Rate limit hit — rotating to Groq key #{self._key_index + 1}")
        self._build_llm()

    @staticmethod
    def _is_rate_limit_error(err: Exception) -> bool:
        msg = str(err).lower()
        return "rate_limit" in msg or "429" in msg or "quota" in msg

    def _invoke_with_rotation(self, llm, messages):
        attempts = len(self._groq_keys)
        last_err = None
        for _ in range(attempts):
            try:
                return llm.invoke(messages)
            except Exception as e:
                if self._is_rate_limit_error(e):
                    last_err = e
                    self._rotate_key()
                    # _rotate_key rebuilds self.llm/self.llm_with_tools/self.llm_json —
                    # re-fetch whichever variant we were using
                    llm = self.llm_json if llm is self.llm_json else (
                        self.llm_with_tools if llm is self.llm_with_tools else self.llm
                    )
                    continue
                raise
        raise last_err or RuntimeError("All Groq keys exhausted")

    # ---- Intent classification node ----
    def classify_node(self, state: ChatState):
        last_text = state["messages"][-1].content if state["messages"] else ""
        intent = heuristic_intent(last_text)
        if intent is None:
            prompt = [
                SystemMessage(content=(
                    "Classify the user's message into exactly one label: "
                    "GRADING, VOCAB, SPEAKING, LOGISTICS, or GENERAL. "
                    "Reply with only the single label word."
                )),
                HumanMessage(content=last_text),
            ]
            try:
                resp = self._invoke_with_rotation(self.llm, prompt)
                label = resp.content.strip().upper()
                intent = label if label in {"GRADING", "VOCAB", "SPEAKING", "LOGISTICS", "GENERAL"} else "GENERAL"
            except Exception:
                intent = "GENERAL"
        return {"intent": intent}

    def route_after_classify(self, state: ChatState):
        return "grade" if state.get("intent") == "GRADING" else "chat"

    # ---- Grading + self-critique ----
    def grade_node(self, state: ChatState):
        essay_text = state["messages"][-1].content
        rubric = retrieve_context(self.kb, "GRADING")
        prompt = [
            SystemMessage(content=(
                "You are a strict but fair IELTS Writing Task 2 examiner. Score the "
                f"essay below against this rubric:\n{rubric}\n\n{GRADING_SCHEMA_HINT}\n\n"
                "If the text below is NOT an actual essay to grade (e.g. it's a question "
                "about scoring, or too short to be a real submission), respond with this "
                'exact JSON instead: {"error": "no_essay_provided"}'
            )),
            HumanMessage(content=essay_text),
        ]
        try:
            response = self._invoke_with_rotation(self.llm_json, prompt)
            draft = json.loads(response.content)
        except Exception as e:
            draft = {"error": "Could not parse grading output", "raw": str(e)}
        return {"grading_result": draft}

    def critique_node(self, state: ChatState):
        essay_text = next(
            (m.content for m in reversed(state["messages"]) if isinstance(m, HumanMessage)), ""
        )
        draft = state.get("grading_result", {})

        # grade_node already flagged "no real essay was submitted" — skip the
        # second LLM call entirely and reply conversationally instead of
        # forcing JSON out of a model that has nothing to grade.
        if draft.get("error") == "no_essay_provided":
            msg = (
                "I'm happy to assess your Writing Task essay and give you detailed "
                "feedback — I'll just need the actual essay text first. Paste it "
                "here and I'll evaluate it against the IELTS criteria."
            )
            return {"grading_result": None, "messages": [AIMessage(content=msg)]}

        rubric = retrieve_context(self.kb, "GRADING")
        prompt = [
            SystemMessage(content=(
                "You are a senior IELTS examiner double-checking a colleague's marking. "
                f"Rubric:\n{rubric}\n\nOriginal essay:\n{essay_text}\n\n"
                f"Draft scores to review:\n{json.dumps(draft)}\n\n"
                "If any score is too generous or too harsh relative to the essay's actual "
                "evidence, correct it. Otherwise keep it as-is. " + GRADING_SCHEMA_HINT
            )),
            HumanMessage(content="Review and return the final scores."),
        ]
        try:
            response = self._invoke_with_rotation(self.llm_json, prompt)
            final = json.loads(response.content)
        except Exception:
            final = draft if "error" not in draft else {
                "error": "Could not complete grading — please try pasting the essay again."
            }

        final = self._attach_ml_second_opinion(final, essay_text)
        summary_text = self._format_grading_reply(final)
        return {"grading_result": final, "messages": [AIMessage(content=summary_text)]}

    @staticmethod
    def _attach_ml_second_opinion(result: dict, essay_text: str) -> dict:
        """Runs the local ML regressor as a sanity check on the LLM's overall_band.
        Never raises — if the predictor is unavailable or the LLM output couldn't
        be parsed, grading proceeds without this field."""
        if _band_predictor is None or "error" in result:
            return result

        llm_band = result.get("overall_band")
        if not isinstance(llm_band, (int, float)):
            return result

        # dataset only distinguishes Task 1 vs Task 2, not Academic/GT within Task 1
        task_type_str = result.get("task_type", "")
        task_type_int = 2 if "Task 2" in task_type_str else 1

        try:
            ml_result = _band_predictor.compare_with_llm(
                llm_band=llm_band,
                essay=essay_text,
                question="",  # engine.py doesn't track a separate prompt/question field
                task_type=task_type_int,
            )
            result["ml_second_opinion"] = ml_result
        except Exception as e:
            print(f"DEBUG: ML second opinion failed ({e}) — continuing without it")
        return result

    @staticmethod
    def _format_grading_reply(result: dict) -> str:
        if "error" in result:
            return "Sorry, I had trouble scoring that essay — could you try pasting it again?"

        task_type = result.get("task_type", "Writing task")
        content_label = result.get("content_criterion_name", "Task Response")
        content = result.get("content_criterion", {})

        lines = [f"{task_type} — Overall Band: {result.get('overall_band', '?')}", ""]
        lines.append(f"{content_label}: {content.get('score', '?')}/9 — {content.get('comment', '')}")
        for key, label in [
            ("coherence_cohesion", "Coherence & Cohesion"),
            ("lexical_resource", "Lexical Resource"),
            ("grammatical_range_accuracy", "Grammatical Range & Accuracy"),
        ]:
            c = result.get(key, {})
            lines.append(f"{label}: {c.get('score', '?')}/9 — {c.get('comment', '')}")

        improvements = result.get("improvements", [])
        if improvements:
            lines.append("")
            lines.append("Where to improve:")
            for imp in improvements:
                lines.append(
                    f"• {imp.get('location', '')}: {imp.get('issue', '')} → {imp.get('suggestion', '')}"
                )

        ml = result.get("ml_second_opinion")
        if ml and ml.get("significant_disagreement"):
            lines.append("")
            lines.append(
                f"Note: an independent statistical check estimated this essay closer to "
                f"band {ml['predicted_band']} — flagging in case you'd like a second look."
            )

        lines.append("")
        lines.append(result.get("summary", ""))
        return "\n".join(lines)

    # ---- General chat (vocab / speaking / logistics / general) ----
    def tool_node(self, state: ChatState):
        last_msg = state["messages"][-1]
        results = []
        for tool_call in last_msg.tool_calls:
            if tool_call["name"] in ["tavily_search_results_json", "tavily_search_results"]:
                query = tool_call["args"]["query"]
                print(f"DEBUG: Searching Tavily for: {query}")
                res = self.tavily.invoke(query)
                results.append(ToolMessage(content=str(res), tool_call_id=tool_call["id"]))
        return {"messages": results}

    def chat_node(self, state: ChatState):
        intent = state.get("intent", "GENERAL")
        context = retrieve_context(self.kb, intent)
        system_prompt = f"""
    You are IELTS Beta, an AI tutor. The user's message has been classified as: {intent}.

    CORE STRENGTHS:
    - Vocabulary coaching, speaking strategy, and IELTS test logistics.
    - Real-time research via Tavily search when you need current info (test dates, fees).
    - Relevant reference context for this request: {context or "none needed for this type of question"}

    INSTRUCTIONS:
    - Be concise, encouraging, and specific to what was asked.
    - Use Tavily only if you genuinely need real-time/current data.
    """
        recent = state["messages"][-MAX_HISTORY_MESSAGES:]
        messages = [SystemMessage(content=system_prompt)] + recent

        response = self._invoke_with_rotation(self.llm_with_tools, messages)
        return {"messages": [response]}

    def route_after_chat(self, state: ChatState):
        last_msg = state["messages"][-1]
        if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
            return "tools"
        return END

    def _build_graph(self):
        builder = StateGraph(ChatState)
        builder.add_node("classify", self.classify_node)
        builder.add_node("grade", self.grade_node)
        builder.add_node("critique", self.critique_node)
        builder.add_node("chat", self.chat_node)
        builder.add_node("tools", self.tool_node)

        builder.set_entry_point("classify")
        builder.add_conditional_edges("classify", self.route_after_classify, {"grade": "grade", "chat": "chat"})
        builder.add_edge("grade", "critique")
        builder.add_edge("critique", END)
        builder.add_conditional_edges("chat", self.route_after_chat, {"tools": "tools", END: END})
        builder.add_edge("tools", "chat")
        return builder.compile(checkpointer=self.memory)

    # ---- Entry point ----
    def run(self, user_input: str, thread_id: str = "default") -> dict:
        cached = self.cache.get(user_input)
        if cached:
            print("DEBUG: Cache hit — skipping LLM call")
            return {"reply": cached, "band_scores": None}

        config = {"configurable": {"thread_id": thread_id}}
        result = self.graph.invoke(
            {"messages": [HumanMessage(content=user_input)], "intent": "", "grading_result": None},
            config=config,
        )
        reply = result["messages"][-1].content
        band_scores = result.get("grading_result")

        if not band_scores:
            self.cache.set(user_input, reply)

        return {"reply": reply, "band_scores": band_scores}
