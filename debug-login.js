// Debug script to test login functionality
// Run this in browser console to test login flow

async function testLogin() {
    console.log('=== Testing Login Flow ===');
    
    // Test credentials
    const testCredentials = [
        { email: 'demo@wellsense.ai', password: 'demo123' },
        { email: 'admin@wellsense.ai', password: 'admin123' },
        { email: 'user@wellsense.ai', password: 'user123' },
        { email: 'wrong@email.com', password: 'wrongpass' }
    ];
    
    // Simulate the validation logic from demoApi
    function validateCredentials(email, password) {
        const validCredentials = [
            { email: 'demo@wellsense.ai', password: 'demo123' },
            { email: 'john@wellsense.ai', password: 'password' },
            { email: 'admin@wellsense.ai', password: 'admin123' },
            { email: 'user@wellsense.ai', password: 'user123' }
        ];
        
        return validCredentials.some(
            cred => cred.email === email && cred.password === password
        );
    }
    
    // Test each credential
    for (const cred of testCredentials) {
        const isValid = validateCredentials(cred.email, cred.password);
        console.log(`Testing ${cred.email} / ${cred.password}: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    console.log('=== End Test ===');
}

// Instructions for use:
console.log('Copy and paste this into browser console:');
console.log('testLogin()');

// Auto-run test
testLogin();