const axios = require('axios');

async function createAdmin() {
    try {
        console.log("Attempting to register test admin account...");
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: "Test College Admin",
            email: "admin@test.edu",
            password: "admin123",
            role: "college"
        });
        console.log("\nSuccess! Account created.");
        console.log("--------------------------------");
        console.log("Email:    admin@test.edu");
        console.log("Password: admin123");
        console.log("Role:     college");
        console.log("--------------------------------");
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error("\nERROR: Could not connect to backend server at http://localhost:5000");
            console.error("Please ensure the backend server is running:");
            console.error("  cd backend");
            console.error("  npm run dev");
        } else {
            console.error("\nError creating account:");
            console.error(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        }
    }
}

createAdmin();
