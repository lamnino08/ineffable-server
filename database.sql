-- Tạo bảng users
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Tạo bảng property_types
CREATE TABLE property_types (
    property_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(50) NOT NULL
);

-- Tạo bảng field (người dùng có thể tạo custom field)
CREATE TABLE field (
    field_of_event_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_ID INT UNSIGNED NOT NULL,
    property_type INT UNSIGNED NOT NULL,
    unit_ID INT UNSIGNED,
    FOREIGN KEY (user_ID) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_type) REFERENCES property_types(property_type_id) ON DELETE CASCADE
);

-- Tạo bảng events (bao gồm các trường mặc định)
CREATE TABLE events (
    event_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_ID INT UNSIGNED NOT NULL,            -- Người tạo sự kiện
    title VARCHAR(255) NOT NULL,              -- Tiêu đề sự kiện
    start_time DATETIME NOT NULL,             -- Thời gian bắt đầu
    end_time DATETIME,                        -- Thời gian kết thúc (có thể null)
    location VARCHAR(255),                    -- Địa điểm
    description TEXT,                         -- Mô tả chi tiết
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo
    FOREIGN KEY (user_ID) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tạo bảng value_field (liên kết các giá trị custom với sự kiện)
CREATE TABLE value_field (
    value_field_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_ID INT UNSIGNED NOT NULL,
    field_ID INT UNSIGNED NOT NULL,
    property_ID INT UNSIGNED NOT NULL,
    FOREIGN KEY (event_ID) REFERENCES events(event_ID) ON DELETE CASCADE,
    FOREIGN KEY (field_ID) REFERENCES field(field_of_event_ID) ON DELETE CASCADE,
    FOREIGN KEY (property_ID) REFERENCES property_types(property_type_id) ON DELETE CASCADE
);

-- Tạo bảng texts (dành cho các custom field kiểu text)
CREATE TABLE texts (
    text_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    value TEXT
);

-- Tạo bảng numbers (dành cho các custom field kiểu number)
CREATE TABLE numbers (
    number_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    value FLOAT,
    format ENUM('integer', 'decimal')
);

-- Tạo bảng selections (dành cho custom field kiểu select)
CREATE TABLE selections (
    select_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    value BOOLEAN
);

-- Tạo bảng multi-selections (dành cho custom field kiểu multi-select)
CREATE TABLE multi_selections (
    multip_selection_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
);

-- Tạo bảng select_option (lựa chọn của multi-select)
CREATE TABLE select_option (
    select_option_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    multip_select_ID INT UNSIGNED NOT NULL,
    description TEXT NOT NULL,
    is_chosen BOOLEAN,
    FOREIGN KEY (multip_select_ID) REFERENCES multi_selections(multip_selection_ID) ON DELETE CASCADE
);

-- Tạo bảng dates (dành cho custom field kiểu date)
CREATE TABLE dates (
    date_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    value DATETIME NOT NULL,
    format ENUM('YYYY-MM-DD', 'MM-DD', 'DD-MM-YYYY') -- Định dạng ngày
);

-- Tạo bảng files (dành cho custom field kiểu file)
CREATE TABLE files (
    file_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    link TEXT NOT NULL
);

-- Tạo bảng links (dành cho custom field kiểu link)
CREATE TABLE links (
    link_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Tạo bảng person (dành cho custom field kiểu person)
CREATE TABLE person (
    person_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tạo bảng status (dành cho custom field kiểu trạng thái)
CREATE TABLE status (
    status_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    selected_ID INT UNSIGNED,
    FOREIGN KEY (selected_ID) REFERENCES status_value(status_value_ID) ON DELETE SET NULL
);

-- Tạo bảng status_value (giá trị trạng thái)
CREATE TABLE status_value (
    status_value_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL
);

-- Tạo bảng current_status (lưu trạng thái hiện tại của sự kiện)
CREATE TABLE current_status (
    current_status_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    status_ID INT UNSIGNED NOT NULL,
    status_value_ID INT UNSIGNED NOT NULL,
    FOREIGN KEY (status_ID) REFERENCES status(status_ID) ON DELETE CASCADE,
    FOREIGN KEY (status_value_ID) REFERENCES status_value(status_value_ID) ON DELETE CASCADE
);

-- Tạo bảng units (Đơn vị)
CREATE TABLE units (
    unit_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL,  -- Tên đơn vị như 'kg', 'USD', 'cm', 'hour'
    description TEXT                 -- Mô tả về đơn vị
);


-- Cập nhật bảng field để tham chiếu tới bảng units (Đơn vị)
ALTER TABLE field
ADD COLUMN unit_ID INT UNSIGNED,  -- Cột unit_ID để tham chiếu đến bảng units
ADD FOREIGN KEY (unit_ID) REFERENCES units(unit_ID) ON DELETE SET NULL;
