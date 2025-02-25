// Create these types in a separate file: types/course.ts
interface CourseMapping {
  course_mapping_id: number;
  institution: {
    name: string;
    logoPicture: string;
    type: string;
    rating: number;
  };
  course: {
    name: string;
    type: string;
    description: string;
  };
  fees: number;
  duration: string;
  likes: number;
  dislikes: number;
  website: string;
  description: string;
  student_qualification: string;
  course_affliation: string;
  status: 'active' | 'inactive';
}