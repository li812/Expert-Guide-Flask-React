export const dummyCourseTypes = [
    { id: 1, course_type: "Undergraduate" },
    { id: 2, course_type: "Postgraduate" },
    { id: 3, course_type: "MOOC" },
    { id: 4, course_type: "Diploma" },
    { id: 5, course_type: "Certificate" }
  ];
  
  export const dummyCareers = [
    { id: 1, career: "Software Engineer" },
    { id: 2, career: "Data Scientist" },
    { id: 3, career: "Doctor" },
    { id: 4, career: "Business Analyst" },
    { id: 5, career: "Research Scientist" },
    { id: 6, career: "Machine Learning Engineer" },
    { id: 7, career: "Cloud Architect" },
    { id: 8, career: "Digital Marketing Specialist" }
  ];
  
  export const dummyMappings = [
    {
      course_mapping_id: 1,
      institution: {
        name: "IIT Delhi",
        logoPicture: "/dummy/iit-delhi.jpg",
        type: "Government",
        rating: 4.8
      },
      course: {
        name: "B.Tech Computer Science",
        type: "Undergraduate",
        description: "4-year bachelor's program in computer science and engineering"
      },
      fees: 200000,
      duration: "4 years",
      likes: 156,
      dislikes: 5,
      website: "http://iitd.ac.in",
      description: "Premier computer science program with focus on AI/ML and distributed systems",
      student_qualification: "12th with PCM",
      course_affliation: "AICTE",
      status: "active"
    },
    {
      course_mapping_id: 2,
      institution: {
        name: "IIM Ahmedabad",
        logoPicture: "/dummy/iim-a.jpg",
        type: "Government",
        rating: 4.9
      },
      course: {
        name: "Master of Business Administration",
        type: "Postgraduate",
        description: "2-year full-time MBA program"
      },
      fees: 2500000,
      duration: "2 years",
      likes: 230,
      dislikes: 8,
      website: "http://iima.ac.in",
      description: "Flagship MBA program focusing on leadership and management excellence",
      student_qualification: "Bachelor's degree with 60%",
      course_affliation: "AICTE",
      status: "active"
    },
    {
      course_mapping_id: 3,
      institution: {
        name: "Coursera",
        logoPicture: "/dummy/coursera.jpg",
        type: "Online Platform",
        rating: 4.5
      },
      course: {
        name: "Deep Learning Specialization",
        type: "MOOC",
        description: "Comprehensive deep learning certification by Andrew Ng"
      },
      fees: 35000,
      duration: "4 months",
      likes: 1250,
      dislikes: 45,
      website: "http://coursera.org",
      description: "5-course specialization covering deep learning fundamentals to advanced topics",
      student_qualification: "Basic Python programming",
      course_affliation: "DeepLearning.AI",
      status: "active"
    },
    {
      course_mapping_id: 4,
      institution: {
        name: "AIIMS Delhi",
        logoPicture: "/dummy/aiims.jpg",
        type: "Government",
        rating: 4.9
      },
      course: {
        name: "MBBS",
        type: "Undergraduate",
        description: "Bachelor of Medicine and Bachelor of Surgery"
      },
      fees: 150000,
      duration: "5.5 years",
      likes: 450,
      dislikes: 12,
      website: "http://aiims.edu",
      description: "Premier medical program including 1-year internship",
      student_qualification: "12th with PCB",
      course_affliation: "NMC",
      status: "active"
    },
    {
      course_mapping_id: 5,
      institution: {
        name: "ISB Hyderabad",
        logoPicture: "/dummy/isb.jpg",
        type: "Private",
        rating: 4.7
      },
      course: {
        name: "Post Graduate Program in Management",
        type: "Postgraduate",
        description: "1-year intensive management program"
      },
      fees: 3500000,
      duration: "1 year",
      likes: 320,
      dislikes: 15,
      website: "http://isb.edu",
      description: "Accelerated management program for experienced professionals",
      student_qualification: "Bachelor's with 2 years experience",
      course_affliation: "AICTE",
      status: "active"
    },
    {
      course_mapping_id: 6,
      institution: {
        name: "Google",
        logoPicture: "/dummy/google.jpg",
        type: "Industry",
        rating: 4.6
      },
      course: {
        name: "Google Cloud Architect",
        type: "Certificate",
        description: "Professional cloud architecture certification"
      },
      fees: 120000,
      duration: "6 months",
      likes: 890,
      dislikes: 25,
      website: "http://cloud.google.com",
      description: "Comprehensive cloud architecture program with hands-on labs",
      student_qualification: "Basic cloud knowledge",
      course_affliation: "Google Cloud",
      status: "active"
    },
    {
      course_mapping_id: 7,
      institution: {
        name: "BITS Pilani",
        logoPicture: "/dummy/bits.jpg",
        type: "Private",
        rating: 4.6
      },
      course: {
        name: "M.Tech Software Engineering",
        type: "Postgraduate",
        description: "2-year master's program in software engineering"
      },
      fees: 450000,
      duration: "2 years",
      likes: 245,
      dislikes: 18,
      website: "http://bits-pilani.ac.in",
      description: "Advanced software engineering program with industry collaboration",
      student_qualification: "B.Tech/B.E in CSE/IT",
      course_affliation: "UGC",
      status: "active"
    },
    {
      course_mapping_id: 8,
      institution: {
        name: "LinkedIn Learning",
        logoPicture: "/dummy/linkedin.jpg",
        type: "Online Platform",
        rating: 4.3
      },
      course: {
        name: "Digital Marketing Professional",
        type: "MOOC",
        description: "Comprehensive digital marketing certification"
      },
      fees: 25000,
      duration: "3 months",
      likes: 678,
      dislikes: 34,
      website: "http://linkedin.com/learning",
      description: "Industry-aligned digital marketing curriculum",
      student_qualification: "None",
      course_affliation: "LinkedIn",
      status: "active"
    },
    {
      course_mapping_id: 9,
      institution: {
        name: "NID Ahmedabad",
        logoPicture: "/dummy/nid.jpg",
        type: "Government",
        rating: 4.5
      },
      course: {
        name: "B.Des Product Design",
        type: "Undergraduate",
        description: "4-year bachelor's program in product design"
      },
      fees: 400000,
      duration: "4 years",
      likes: 189,
      dislikes: 12,
      website: "http://nid.edu",
      description: "Creative product design program with industry projects",
      student_qualification: "12th with design aptitude",
      course_affliation: "Ministry of Commerce",
      status: "active"
    },
    {
      course_mapping_id: 10,
      institution: {
        name: "Microsoft",
        logoPicture: "/dummy/microsoft.jpg",
        type: "Industry",
        rating: 4.7
      },
      course: {
        name: "Azure Solutions Architect",
        type: "Certificate",
        description: "Professional cloud architecture certification"
      },
      fees: 80000,
      duration: "6 months",
      likes: 567,
      dislikes: 23,
      website: "http://microsoft.com/learn",
      description: "Expert-level Azure cloud architecture certification",
      student_qualification: "Basic cloud knowledge",
      course_affliation: "Microsoft",
      status: "active"
    }
  ];
  
  export const dummyLocations = {
    states: [
      "Maharashtra",
      "Delhi",
      "Karnataka",
      "Tamil Nadu",
      "Gujarat",
      "Telangana",
      "West Bengal",
      "Uttar Pradesh"
    ]
  };