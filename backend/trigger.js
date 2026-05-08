fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        firstName: "Himanshu",
        lastName: "Varotariya",
        email: "himanshu@medicare.com",
        password: "Password123!",
        role: "doctor",
        specialization: "General Practice",
        experience: "5 years",
        consultationFee: 150,
        licenseNumber: "LIC12345"
    })
}).then(r => r.json()).then(console.log).catch(console.error);
