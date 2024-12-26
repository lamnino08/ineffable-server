// src/models/PropertyTypeClass.ts
export class PropertyType {
    static TEXT = 1;
    static NUMBER = 2;
    static SELECT = 3;
    static MULTISELECT = 4;
    static STATUS = 5;
    static DATE = 6;
    static PHONE = 7;
    static PERSON = 8;
    static FILE = 9;
    static LINK = 10;
  
    // Hàm trả về nhãn (label) của từng property type
    static getLabel(propertyTypeId: number): string {
      switch (propertyTypeId) {
        case PropertyType.TEXT: return "Text";
        case PropertyType.NUMBER: return "Number";
        case PropertyType.SELECT: return "Select";
        case PropertyType.MULTISELECT: return "Multiselect";
        case PropertyType.STATUS: return "Status";
        case PropertyType.DATE: return "Date";
        case PropertyType.PHONE: return "Phone";
        case PropertyType.PERSON: return "Person";
        case PropertyType.FILE: return "File";
        case PropertyType.LINK: return "Link";
        default: return "Unknown";
      }
    }
  
    // Hàm trả về tất cả các loại property type (dưới dạng mảng)
    static getAllTypes(): { id: number, label: string }[] {
      return [
        { id: PropertyType.TEXT, label: PropertyType.getLabel(PropertyType.TEXT) },
        { id: PropertyType.NUMBER, label: PropertyType.getLabel(PropertyType.NUMBER) },
        { id: PropertyType.SELECT, label: PropertyType.getLabel(PropertyType.SELECT) },
        { id: PropertyType.MULTISELECT, label: PropertyType.getLabel(PropertyType.MULTISELECT) },
        { id: PropertyType.STATUS, label: PropertyType.getLabel(PropertyType.STATUS) },
        { id: PropertyType.DATE, label: PropertyType.getLabel(PropertyType.DATE) },
        { id: PropertyType.PHONE, label: PropertyType.getLabel(PropertyType.PHONE) },
        { id: PropertyType.PERSON, label: PropertyType.getLabel(PropertyType.PERSON) },
        { id: PropertyType.FILE, label: PropertyType.getLabel(PropertyType.FILE) },
        { id: PropertyType.LINK, label: PropertyType.getLabel(PropertyType.LINK) }
      ];
    }
  }
  