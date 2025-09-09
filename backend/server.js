import app from "./app.js";
const PORT = process.env.PORT || 4010;
// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Almoktabar';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'https://almoktabar.online'; 
process.env.BACKEND_URL = process.env.BACKEND_URL || 'https://api.almoktabar.online';
// SMTP/Gmail defaults (override in real env)
process.env.SMTP_HOST = process.env.SMTP_HOST || 'softwarefikra@gmail.com';
process.env.SMTP_PORT = process.env.SMTP_PORT || '465';
process.env.SMTP_USERNAME = process.env.SMTP_USERNAME || 'softwarefikra@gmail.com';
process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'zhszyjhscrakjcwk';
process.env.SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME;
process.env.SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'Almoktabar';

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
    console.log(`production backend URL: ${process.env.BACKEND_URL}`);
    console.log(`production client URL: ${process.env.CLIENT_URL}`);
    console.log(`SMTP host: ${process.env.SMTP_HOST}, from: ${process.env.SMTP_FROM_EMAIL}`);
})