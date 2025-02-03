import axios from 'axios';

// Hàm tạo email ngẫu nhiên
function generateRandomEmail(): string {
    const randomString = Math.random().toString(36).substring(2, 10); // Tạo chuỗi ngẫu nhiên
    return `${randomString}@example.com`; // Kết hợp với domain
}

// Hàm gọi API login
async function callLoginAPI(email: string, password: string): Promise<void> {
    try {
        const response = await axios.post('http://localhost:3004/auth/login', {
            email: email,
            password: password
        });
        console.log(`Success: ${email} - ${response.status}`);
    } catch (error) {
        console.error(`Error: ${email} - ${error.message}`);
    }
}

// Hàm thực hiện 9.800.000 lần gọi API
async function runMultipleAPICalls(): Promise<void> {
    const totalCalls = 9800000;
    const password = '12345678';

    for (let i = 0; i < totalCalls; i++) {
        const email = generateRandomEmail();
        await callLoginAPI(email, password);
        
        // Hiển thị tiến trình sau mỗi 1000 lần gọi
        if (i % 1000 === 0) {
            console.log(`Progress: ${i}/${totalCalls}`);
        }
    }
}

// Chạy chương trình
runMultipleAPICalls().then(() => {
    console.log('All API calls completed.');
}).catch((error) => {
    console.error('Error during API calls:', error);
});