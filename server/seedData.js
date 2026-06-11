const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

dotenv.config();

const clubNames = [
  'Tech Innovators', 'Debate Society', 'Eco Warriors', 'Drama Club', 'Photography Guild',
  'Robotics Team', 'Music Band', 'Literary Arts', 'Chess Masters', 'Fitness Freaks'
];
const eventTypes = ['Workshop', 'Hackathon', 'Seminar', 'Competition', 'Meetup'];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    console.log('Clearing existing seeded test data...');
    // We will clear existing students to prevent email duplicates
    await User.deleteMany({ email: { $regex: /@studentseed\.com/ } });
    await Club.deleteMany({ name: { $in: clubNames } });
    await Event.deleteMany({ title: { $regex: /Event/ } });

    // 1. Create 20 Students
    const students = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (let i = 1; i <= 20; i++) {
        // use an elegant avatar from ui-avatars
        const name = `Test Student ${i}`;
        const profileImage = `https://ui-avatars.com/api/?name=Test+Student+${i}&background=random`;
        
        students.push({
            name,
            email: `student${i}@studentseed.com`,
            password: hashedPassword,
            role: 'student',
            profileImage,
            oauthProvider: 'local'
        });
    }
    const createdStudents = await User.insertMany(students);
    console.log(`✅ Created 20 Students`);

    // We need a superadmin or admin to be the creator of the clubs
    // Find first admin or just use the first student as creator for testing
    let creator = await User.findOne({ role: 'admin' });
    if (!creator) creator = createdStudents[0];

    // 2. Create 10 Clubs with Banners
    // Picsum provides consistent images per seed
    const clubs = [];
    for (let i = 0; i < 10; i++) {
        clubs.push({
            name: clubNames[i],
            description: `This is the official page for the ${clubNames[i]}. Join us to explore and grow!`,
            category: 'Technical', // default
            status: 'approved',
            createdBy: creator._id,
            bannerUrl: `https://picsum.photos/seed/club${i}/1200/400`, // Random consistent banner
            thumbnailUrl: `https://picsum.photos/seed/clubthumb${i}/200/200`
        });
    }
    const createdClubs = await Club.insertMany(clubs);
    console.log(`✅ Created 10 Clubs with seeded banner URLs`);

    // 3. Create 2 Events per Club (Total 20 Events)
    const events = [];
    for (const club of createdClubs) {
        for (let j = 1; j <= 2; j++) {
            const date = new Date();
            date.setDate(date.getDate() + Math.floor(Math.random() * 30) + 1); // 1-30 days in future

            events.push({
                title: `${club.name} ${eventTypes[Math.floor(Math.random()*eventTypes.length)]} ${j}`,
                description: `An exciting upcoming event hosted by ${club.name}. Don't miss out!`,
                date: date,
                venue: `Room ${Math.floor(Math.random() * 100) + 101}`,
                capacity: Math.floor(Math.random() * 50) + 50,
                maxParticipants: Math.floor(Math.random() * 50) + 50,
                category: 'Technical',
                coverImageUrl: `https://picsum.photos/seed/event${club._id}${j}/800/400`,
                clubId: club._id,
                createdBy: creator._id
            });
        }
    }
    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created 20 Events`);

    // 4. Register Students to Events (Randomly 3-5 events per student)
    const registrations = [];
    for (const student of createdStudents) {
        // Pick 4 random events for this student
        const shuffledEvents = createdEvents.sort(() => 0.5 - Math.random());
        const selectedEvents = shuffledEvents.slice(0, 4);

        for (const ev of selectedEvents) {
            registrations.push({
                eventId: ev._id,
                studentId: student._id,
                status: 'accepted',
                attendanceStatus: Math.random() > 0.5 ? 'present' : 'pending',
                githubProfile: `https://github.com/student${student._id.toString().substring(0, 5)}`
            });
        }
    }
    await Registration.insertMany(registrations);
    console.log(`✅ Created ${registrations.length} Registrations`);

    console.log('🎉 Seeding Complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
