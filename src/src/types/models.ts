// src/types/models.ts

export interface Course {
    CourseID?: number;
    UserID: number;
    Name?: string;
    CreateAt?: Date;
    State?: string;
    PictureLink?: string;
    ShortCut?: string;
    Description?: string;
    Cost?: number;
  }
  
  export interface Chapter {
    ChapterID: number;
    CourseID: number;
    OrderNumber?: number;
    Title?: string;
    Description?: string;
  }
  
  export interface Lesson {
    LessonID?: number;
    ChapterID: number;
    FileLink?: string;
    Title?: string;
    Duration?: Number;
    OrderNumber?: number;
    Description?: string;
    IsAllowDemo?: boolean;
  }
  