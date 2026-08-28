import os
import json
import time
import sqlite3
from typing import TypedDict, Annotated
from dotenv import load_dotenv
load_dotenv()

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults as TavilySearch


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def load_knowledge_base():
    try:
        with open("knowledge.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "Audio Lab": "Practice listening materials and strategies",
            "Draftroom": "Writing practice and feedback section",
            "Studio": "Speaking practice environment",
        }


# ---- Config (all overridable via .env, sensible defaults if unset) ----
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "12"))   # how many recent turns go to the LLM
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", str(24 * 3600)))  # 24h default
CACHE_FILE = "response_cache.json"


class ResponseCache:
    """Exact-match cache for repeated questions (e.g. the quick-prompt chips).
    Persisted to disk so it survives server restarts, not just in-memory."""

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
            pass  # cache is a nice-to-have, never let it break a chat request

    @staticmethod
    def _key(text: str) -> str:
        return " ".join(text.strip().lower().split())

    def get(self, text: str) -> str | None:
        entry = self._data.get(self._key(text))
        if not entry:
            return None
        if time.time() - entry["ts"] > self.ttl:
            return None  # expired — e.g. stale test dates/fees
        return entry["reply"]

    def set(self, text: str, reply: str):
        self._data[self._key(text)] = {"reply": reply, "ts": time.time()}
        self._save()


class IELTSGraphEngine:
    def __init__(self):
        # Comma-separated list of free-tier keys, e.g. GROQ_API_KEYS=key1,key2,key3
        # Falls back to the single GROQ_API_KEY if the plural var isn't set.
        keys_env = os.getenv("GROQ_API_KEYS") or os.getenv("GROQ_API_KEY", "")
        self._groq_keys = [k.strip() for k in keys_env.split(",") if k.strip()]
        if not self._groq_keys:
            raise RuntimeError("No Groq API key(s) found — set GROQ_API_KEY or GROQ_API_KEYS in .env")
        self._key_index = 0

        self.tavily = TavilySearch(api_key=os.getenv("TAVILY_API_KEY"))
        self.tools = [self.tavily]

        self._build_llm()  # sets self.llm / self.llm_with_tools from the current key

        self.kb = load_knowledge_base()
        self.cache = ResponseCache()

        self.db_conn = sqlite3.connect("checkpoint.db", check_same_thread=False)
        self.memory = SqliteSaver(self.db_conn)

        self.graph = self._build_graph()

    # ---- Multi-key rotation ----
    def _build_llm(self):
        key = self._groq_keys[self._key_index]
        # llama-3.3-70b-versatile was deprecated by Groq (June 2026). Using
        # openai/gpt-oss-120b, their recommended replacement — kept as an env
        # var so a future deprecation is a .env edit, not a code change.
        model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
        self.llm = ChatGroq(api_key=key, model=model)
        self.llm_with_tools = self.llm.bind_tools(self.tools)

    def _rotate_key(self):
        self._key_index = (self._key_index + 1) % len(self._groq_keys)
        print(f"DEBUG: Rate limit hit — rotating to Groq key #{self._key_index + 1}")
        self._build_llm()

    @staticmethod
    def _is_rate_limit_error(err: Exception) -> bool:
        msg = str(err).lower()
        return "rate_limit" in msg or "429" in msg or "quota" in msg

    def _invoke_with_rotation(self, messages):
        """Try the current key; on a rate-limit error, rotate through the rest
        of the pool once each before giving up."""
        attempts = len(self._groq_keys)
        last_err = None
        for _ in range(attempts):
            try:
                return self.llm_with_tools.invoke(messages)
            except Exception as e:
                if self._is_rate_limit_error(e):
                    last_err = e
                    self._rotate_key()
                    continue
                raise  # not a rate-limit issue — don't swallow real errors
        raise last_err or RuntimeError("All Groq keys exhausted")

    # ---- Graph nodes ----
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
        system_prompt = f"""
    You are IELTS Beta, an advanced AI tutor specializing in Writing Task 2 feedback.

    CORE STRENGTHS:
    - Detailed Writing Task 2 feedback using official IELTS rubrics.
    - Advanced logical reasoning via LangGraph.
    - Real-time research via Tavily search for test dates and fees.
    - Context-aware scoring based on our internal Knowledge Base: {self.kb}

    INSTRUCTIONS:
    - Provide structured feedback with headings and bullet points.
    - Use Tavily if you need real-time data.
    - Be strict but encouraging with band scores (0-9).
    """
        # Trim to the most recent N messages so token usage per call doesn't
        # grow unbounded as a conversation gets long.
        recent = state["messages"][-MAX_HISTORY_MESSAGES:]
        messages = [SystemMessage(content=system_prompt)] + recent

        print("Sending to LLM...")
        response = self._invoke_with_rotation(messages)
        return {"messages": [response]}

    def _build_graph(self):
        builder = StateGraph(ChatState)
        builder.add_node("chat", self.chat_node)
        builder.add_node("tools", self.tool_node)
        builder.set_entry_point("chat")

        def route_after_chat(state):
            last_msg = state["messages"][-1]
            if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
                return "tools"
            return END

        builder.add_conditional_edges("chat", route_after_chat)
        builder.add_edge("tools", "chat")
        return builder.compile(checkpointer=self.memory)

    # ---- Entry point ----
    def run(self, user_input: str, thread_id: str = "default"):
        # Cache check — skips the LLM (and Tavily) call entirely on an exact repeat,
        # e.g. someone tapping the same quick-prompt chip twice.
        cached = self.cache.get(user_input)
        if cached:
            print("DEBUG: Cache hit — skipping LLM call")
            return cached

        config = {"configurable": {"thread_id": thread_id}}
        result = self.graph.invoke(
            {"messages": [HumanMessage(content=user_input)]},
            config=config,
        )
        reply = result["messages"][-1].content
        self.cache.set(user_input, reply)
        return reply
