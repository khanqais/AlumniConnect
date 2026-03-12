/**
 * Seed script — populates the database with realistic alumni users
 * Run: node seed.js   (from the backend/ directory)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

const alumni = [
    {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2019,
        experience: '5 years',
        company: 'Google',
        jobTitle: 'Senior Software Engineer',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'GraphQL', 'Docker'],
        bio: 'Full-stack engineer at Google, specialising in web performance and developer tooling.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Priya Sharma',
        email: 'priya.sharma@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2020,
        experience: '4 years',
        company: 'Microsoft',
        jobTitle: 'Data Scientist',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Power BI', 'Azure'],
        bio: 'Data Scientist at Microsoft working on NLP and recommendation systems.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Rohit Patel',
        email: 'rohit.patel@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2018,
        experience: '6 years',
        company: 'Amazon',
        jobTitle: 'Backend Engineer',
        skills: ['Java', 'Spring Boot', 'AWS', 'Kubernetes', 'PostgreSQL', 'Redis'],
        bio: 'Backend engineer at Amazon, building scalable microservices for Prime Video.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Sneha Kulkarni',
        email: 'sneha.kulkarni@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2021,
        experience: '3 years',
        company: 'Flipkart',
        jobTitle: 'Frontend Developer',
        skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Redux', 'Webpack'],
        bio: 'Building the next-gen shopping experience at Flipkart.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Kunal Desai',
        email: 'kunal.desai@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2017,
        experience: '7 years',
        company: 'Infosys',
        jobTitle: 'DevOps Engineer',
        skills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Terraform', 'Linux', 'Python'],
        bio: 'DevOps engineer helping teams ship faster with CI/CD pipelines.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Meera Nair',
        email: 'meera.nair@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2020,
        experience: '4 years',
        company: 'Zomato',
        jobTitle: 'Android Developer',
        skills: ['Kotlin', 'Java', 'Android', 'Firebase', 'REST API', 'MVVM'],
        bio: 'Android engineer at Zomato, delivering food and great UX.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Aditya Joshi',
        email: 'aditya.joshi@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2019,
        experience: '5 years',
        company: 'Razorpay',
        jobTitle: 'Full Stack Engineer',
        skills: ['Node.js', 'React', 'MongoDB', 'Express', 'JavaScript', 'Redis'],
        bio: 'Building payment infrastructure at Razorpay.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Tanvi Gupta',
        email: 'tanvi.gupta@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2022,
        experience: '2 years',
        company: 'PhonePe',
        jobTitle: 'ML Engineer',
        skills: ['Python', 'Machine Learning', 'Scikit-learn', 'Pandas', 'NumPy', 'FastAPI'],
        bio: 'Working on fraud detection models at PhonePe.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.singh@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2016,
        experience: '8 years',
        company: 'Wipro',
        jobTitle: 'Cloud Architect',
        skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Python'],
        bio: 'Cloud Architect designing enterprise solutions on multi-cloud platforms.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Ishaan Bose',
        email: 'ishaan.bose@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2021,
        experience: '3 years',
        company: 'Swiggy',
        jobTitle: 'iOS Developer',
        skills: ['Swift', 'Objective-C', 'iOS', 'Xcode', 'Firebase', 'REST API'],
        bio: 'Building iOS features for the Swiggy app used by millions.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Kavya Reddy',
        email: 'kavya.reddy@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2020,
        experience: '4 years',
        company: 'CRED',
        jobTitle: 'Product Engineer',
        skills: ['React', 'Node.js', 'GraphQL', 'PostgreSQL', 'TypeScript', 'AWS'],
        bio: 'Product engineer at CRED working on fintech features.',
        isApproved: true,
        isEmailVerified: true,
    },
    {
        name: 'Sameer Khan',
        email: 'sameer.khan@alumni.example.com',
        role: 'alumni',
        collegeName: 'Thadomal',
        graduationYear: 2018,
        experience: '6 years',
        company: 'TCS',
        jobTitle: 'Data Engineer',
        skills: ['Python', 'Spark', 'Hadoop', 'SQL', 'Kafka', 'Airflow', 'AWS'],
        bio: 'Building big data pipelines at TCS for enterprise clients.',
        isApproved: true,
        isEmailVerified: true,
    },
];

const SEED_PASSWORD = 'Alumni@123456';

const seed = async () => {
    await connectDB();
    console.log('Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    for (const alum of alumni) {
        const existing = await User.findOne({ email: alum.email });
        if (existing) {
            console.log(`  SKIP  ${alum.name} (${alum.email}) — already exists`);
            skipped++;
            continue;
        }
        await User.create({ ...alum, password: hashedPassword });
        console.log(`  OK    ${alum.name} — ${alum.jobTitle} @ ${alum.company}`);
        created++;
    }

    console.log(`\nDone! Created: ${created}  Skipped: ${skipped}`);
    console.log(`All alumni password: ${SEED_PASSWORD}`);
    await mongoose.disconnect();
};

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
