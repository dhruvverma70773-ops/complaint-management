// seeds/seed.js
// Populates the database with initial data:
//   - 1 admin user
//   - 2 citizen users
//   - 10 sample complaints

const dotenv    = require('dotenv');
const path      = require('path');
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const connectDB = require('../config/db');
const User      = require('../models/User');
const Complaint = require('../models/Complaint');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ── Sample data ───────────────────────────────────────────────────────────────

const users = [
  {
    name:     'Admin User',
    email:    'admin@cms.com',
    phone:    '9000000001',
    password: 'admin123',
    role:     'admin',
  },
  {
    name:     'Dhruv Verma',
    email:    'dhruv@citizen.com',
    phone:    '9876543210',
    password: 'citizen123',
    role:     'citizen',
  },
  {
    name:     'Priya Patel',
    email:    'priya@citizen.com',
    phone:    '9876543211',
    password: 'citizen123',
    role:     'citizen',
  },
];

const seedComplaints = (citizenIds) => [
  {
    title:       'No water supply for 3 days',
    category:    'Water',
    description: 'There has been no water supply in sector 12 for the past 3 days. Residents are suffering severely.',
    location:    'Sector 12, Block A, Near Park',
    priority:    'High',
    status:      'Pending',
    citizen:     citizenIds[0],
  },
  {
    title:       'Street light not working',
    category:    'Electricity',
    description: 'Three street lights near the main market are not functioning for a week. Area is dark and unsafe at night.',
    location:    'Main Market Road, Sector 5',
    priority:    'Medium',
    status:      'In Progress',
    citizen:     citizenIds[0],
  },
  {
    title:       'Pothole on main road causing accidents',
    category:    'Roads',
    description: 'A large pothole on the main highway is causing accidents. Two bikes have already skidded.',
    location:    'NH-48, Near Petrol Pump',
    priority:    'High',
    status:      'Resolved',
    citizen:     citizenIds[1],
  },
  {
    title:       'Garbage not collected for 5 days',
    category:    'Sanitation',
    description: 'The garbage truck has not visited our locality for the past 5 days. There is a big pile of waste.',
    location:    'Gandhi Nagar, Colony 3',
    priority:    'High',
    status:      'Pending',
    citizen:     citizenIds[1],
  },
  {
    title:       'Broken footpath near school',
    category:    'Roads',
    description: 'The footpath near the government school is completely broken. Children are walking on the road which is dangerous.',
    location:    'School Road, Sector 8',
    priority:    'Medium',
    status:      'Pending',
    citizen:     citizenIds[0],
  },
  {
    title:       'Open manhole in residential area',
    category:    'Sanitation',
    description: 'An open manhole near the park is a safety hazard, especially for children playing in the area.',
    location:    'Park Street, Sector 4',
    priority:    'High',
    status:      'In Progress',
    citizen:     citizenIds[1],
  },
  {
    title:       'Illegal construction blocking drainage',
    category:    'Other',
    description: 'Illegal construction on plot no. 45 is blocking the main drainage causing water logging in adjacent houses.',
    location:    'Plot 45, Sector 9',
    priority:    'Medium',
    status:      'Rejected',
    citizen:     citizenIds[0],
  },
  {
    title:       'Transformer damaged, power outage',
    category:    'Electricity',
    description: 'The transformer in Sector 3 was damaged during the storm. There is a complete power outage.',
    location:    'Sector 3, Block B',
    priority:    'High',
    status:      'Resolved',
    citizen:     citizenIds[1],
  },
  {
    title:       'Sewage water overflowing on street',
    category:    'Sanitation',
    description: 'Sewage water is overflowing on the main street causing a very unhygienic situation.',
    location:    'Station Road, Ward 7',
    priority:    'High',
    status:      'Pending',
    citizen:     citizenIds[0],
  },
  {
    title:       'No drinking water supply since 2 days',
    category:    'Water',
    description: 'Water supply pipes are broken and there is no drinking water. People are struggling to get clean water.',
    location:    'Nehru Colony, Block D',
    priority:    'High',
    status:      'In Progress',
    citizen:     citizenIds[1],
  },
];

// ── Main seeder function ───────────────────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    // Reset the counter so complaint IDs start from CMP-0001
    await mongoose.connection.collection('counters').deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Hash passwords and create users
    const createdUsers = await User.create(
      users.map((u) => ({ ...u })) // pre-save hook will handle hashing
    );
    console.log(`👥 Created ${createdUsers.length} users`);

    // Get citizen user IDs
    const citizens = createdUsers.filter((u) => u.role === 'citizen');
    const admin    = createdUsers.find((u) => u.role === 'admin');

    // Create complaints
    const complaintData = seedComplaints([citizens[0]._id, citizens[1]._id]);

    // Add statusHistory to each complaint
    const complaintsWithHistory = complaintData.map((c) => ({
      ...c,
      statusHistory: [
        {
          status:    'Pending',
          remark:    'Complaint registered',
          updatedBy: c.citizen,
        },
        ...(c.status !== 'Pending'
          ? [{ status: c.status, remark: 'Status updated by admin', updatedBy: admin._id }]
          : []),
      ],
    }));

    await Complaint.create(complaintsWithHistory);
    console.log(`📋 Created ${complaintData.length} complaints`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📧 Demo Credentials:');
    console.log('   Admin:   admin@cms.com   / admin123');
    console.log('   Citizen: dhruv@citizen.com / citizen123');
    console.log('   Citizen: priya@citizen.com / citizen123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
