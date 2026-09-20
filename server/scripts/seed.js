require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Department = require('../src/models/Department');
const User = require('../src/models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // 1. Seed Departments
    const departments = [
      { code: 'ROAD', name: 'Road / Public Works Department', issueTypes: ['Pothole', 'Road Damage'] },
      { code: 'SANITATION', name: 'Sanitation Department', issueTypes: ['Garbage'] },
      { code: 'ELECTRICAL', name: 'Electrical / Municipal Department', issueTypes: ['Damaged Streetlight'] },
      { code: 'WATER', name: 'Water Supply Department', issueTypes: ['Water Leakage'] },
      { code: 'DRAINAGE', name: 'Drainage / Sewerage Department', issueTypes: ['Drainage'] },
      { code: 'INFRASTRUCTURE', name: 'Public Infrastructure Authority', issueTypes: ['Public Infrastructure Damage'] }
    ];

    const deptMap = {};
    for (const deptData of departments) {
      let dept = await Department.findOne({ code: deptData.code });
      if (!dept) {
        dept = await Department.create(deptData);
        console.log(`Created department: ${dept.code}`);
      }
      deptMap[dept.code] = dept._id;
    }

    // 2. Seed Admin
    if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
      const adminExists = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL });
      if (!adminExists) {
        const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
        await User.create({
          name: 'System Admin',
          email: process.env.SEED_ADMIN_EMAIL,
          passwordHash,
          role: 'admin'
        });
        console.log('Created Admin User');
      }
    }

    // 3. Seed Authorities
    const authoritiesToSeed = [
      { code: 'ROAD', emailEnv: 'SEED_ROAD_AUTH_EMAIL', passEnv: 'SEED_ROAD_AUTH_PASSWORD', name: 'Road Authority' },
      { code: 'SANITATION', emailEnv: 'SEED_SANITATION_AUTH_EMAIL', passEnv: 'SEED_SANITATION_AUTH_PASSWORD', name: 'Sanitation Authority' },
      { code: 'ELECTRICAL', emailEnv: 'SEED_ELECTRICAL_AUTH_EMAIL', passEnv: 'SEED_ELECTRICAL_AUTH_PASSWORD', name: 'Electrical Authority' },
      { code: 'WATER', emailEnv: 'SEED_WATER_AUTH_EMAIL', passEnv: 'SEED_WATER_AUTH_PASSWORD', name: 'Water Authority' },
      { code: 'DRAINAGE', emailEnv: 'SEED_DRAINAGE_AUTH_EMAIL', passEnv: 'SEED_DRAINAGE_AUTH_PASSWORD', name: 'Drainage Authority' },
      { code: 'INFRASTRUCTURE', emailEnv: 'SEED_INFRA_AUTH_EMAIL', passEnv: 'SEED_INFRA_AUTH_PASSWORD', name: 'Infrastructure Authority' }
    ];

    for (const authSeed of authoritiesToSeed) {
      const email = process.env[authSeed.emailEnv];
      const password = process.env[authSeed.passEnv];
      
      if (email && password) {
        const authExists = await User.findOne({ email });
        if (!authExists) {
          const passwordHash = await bcrypt.hash(password, 10);
          await User.create({
            name: authSeed.name,
            email: email,
            passwordHash,
            role: 'authority',
            departmentId: deptMap[authSeed.code]
          });
          console.log(`Created Authority User for ${authSeed.code}`);
        }
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
