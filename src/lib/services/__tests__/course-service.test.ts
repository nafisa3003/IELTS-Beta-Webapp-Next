import { CourseService } from "@/lib/services/course-service";
import { CourseRepository } from "@/lib/repositories/course.repository";
import { ContentRepository } from "@/lib/repositories/content.repository";
import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { TeacherCourseRepository } from "@/lib/repositories/teacher-course.repository";

jest.mock("@/lib/repositories/course.repository");
jest.mock("@/lib/repositories/content.repository");
jest.mock("@/lib/repositories/enrollment.repository");
jest.mock("@/lib/repositories/teacher-course.repository");

const MockedCourseRepo = CourseRepository as jest.MockedClass<typeof CourseRepository>;
const MockedContentRepo = ContentRepository as jest.MockedClass<typeof ContentRepository>;
const MockedEnrollmentRepo = EnrollmentRepository as jest.MockedClass<typeof EnrollmentRepository>;
const MockedTeacherCourseRepo = TeacherCourseRepository as jest.MockedClass<typeof TeacherCourseRepository>;

function course(id: string) {
  return { courseid: id, title: `Course ${id}` } as never;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CourseService.getStudentLearningView", () => {
  it("includes only active enrollments, dropping other statuses", async () => {
    MockedEnrollmentRepo.prototype.findByStudent.mockResolvedValue([
      { enrollid: "e1", courseid: "c1", status: "active" },
      { enrollid: "e2", courseid: "c2", status: "dropped" },
    ] as never);
    MockedCourseRepo.prototype.findById.mockImplementation((id: string) => Promise.resolve(course(id)));
    MockedContentRepo.prototype.findByCourse.mockResolvedValue([{ contentid: "ct1" }] as never);

    const service = new CourseService({} as never);
    const result = await service.getStudentLearningView("s1");

    expect(result).toHaveLength(1);
    expect(result[0].enrollid).toBe("e1");
    expect(MockedCourseRepo.prototype.findById).toHaveBeenCalledTimes(1);
    expect(MockedCourseRepo.prototype.findById).toHaveBeenCalledWith("c1");
  });

  it("returns an empty contents array when the course no longer exists", async () => {
    MockedEnrollmentRepo.prototype.findByStudent.mockResolvedValue([
      { enrollid: "e1", courseid: "c1", status: "active" },
    ] as never);
    MockedCourseRepo.prototype.findById.mockResolvedValue(null);

    const service = new CourseService({} as never);
    const result = await service.getStudentLearningView("s1");

    expect(result[0].contents).toEqual([]);
    expect(MockedContentRepo.prototype.findByCourse).not.toHaveBeenCalled();
  });
});

describe("CourseService.browseUnenrolledCourses", () => {
  it("excludes courses the student is actively enrolled in", async () => {
    MockedCourseRepo.prototype.findAll.mockResolvedValue([course("c1"), course("c2"), course("c3")]);
    MockedEnrollmentRepo.prototype.findByStudent.mockResolvedValue([
      { enrollid: "e1", courseid: "c1", status: "active" },
      { enrollid: "e2", courseid: "c2", status: "dropped" },
    ] as never);

    const service = new CourseService({} as never);
    const result = await service.browseUnenrolledCourses("s1");

    // c1 excluded (active), c2 included (dropped enrollment doesn't count), c3 included (never enrolled)
    expect(result.map((c) => c.courseid).sort()).toEqual(["c2", "c3"]);
  });

  it("returns every course when the student has no enrollments", async () => {
    MockedCourseRepo.prototype.findAll.mockResolvedValue([course("c1"), course("c2")]);
    MockedEnrollmentRepo.prototype.findByStudent.mockResolvedValue([]);

    const service = new CourseService({} as never);
    const result = await service.browseUnenrolledCourses("s1");

    expect(result).toHaveLength(2);
  });
});

describe("CourseService.getTeacherCourses", () => {
  it("filters out courses that no longer exist", async () => {
    MockedTeacherCourseRepo.prototype.findByTeacher.mockResolvedValue([
      { teachercourseid: "tc1", courseid: "c1" },
      { teachercourseid: "tc2", courseid: "c2" },
    ] as never);
    MockedCourseRepo.prototype.findById.mockImplementation((id: string) =>
      Promise.resolve(id === "c1" ? course("c1") : null)
    );

    const service = new CourseService({} as never);
    const result = await service.getTeacherCourses("t1");

    expect(result).toHaveLength(1);
    expect(result[0].courseid).toBe("c1");
  });
});

describe("CourseService simple delegate methods", () => {
  it("enrollStudent passes the optional batchid through", async () => {
    MockedEnrollmentRepo.prototype.enroll.mockResolvedValue({ enrollid: "e1" } as never);
    const service = new CourseService({} as never);
    await service.enrollStudent("s1", "c1", "b1");
    expect(MockedEnrollmentRepo.prototype.enroll).toHaveBeenCalledWith("s1", "c1", "b1");
  });

  it("dropEnrollment delegates to the enrollment repository", async () => {
    const service = new CourseService({} as never);
    await service.dropEnrollment("e1");
    expect(MockedEnrollmentRepo.prototype.drop).toHaveBeenCalledWith("e1");
  });

  it("assignTeacherToCourse delegates to the teacher-course repository", async () => {
    const service = new CourseService({} as never);
    await service.assignTeacherToCourse("t1", "c1");
    expect(MockedTeacherCourseRepo.prototype.assign).toHaveBeenCalledWith("t1", "c1");
  });
});
