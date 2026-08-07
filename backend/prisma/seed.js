const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@aeraltd.rw',
      password: adminPassword,
      fullName: 'Managing Director',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ Created admin: ${admin.username}`);

  // Create demo worker
  const workerPassword = await bcrypt.hash('worker123', 10);
  const worker = await prisma.user.upsert({
    where: { username: 'worker1' },
    update: {},
    create: {
      username: 'worker1',
      email: 'worker@aeraltd.rw',
      password: workerPassword,
      fullName: 'John Worker',
      role: 'WORKER',
      isActive: true,
    },
  });
  console.log(`✅ Created worker: ${worker.username}`);

  // Create demo services
  const services = [
    {
      serviceType: 'IT_MAINTENANCE',
      clientName: 'Gakenke Hospital',
      clientPhone: '+250 788 123 456',
      clientEmail: 'info@gakenkehospital.rw',
      location: 'Gakenke',
      district: 'Gakenke',
      amount: 250000,
      amountPaid: 250000,
      paymentStatus: 'PAID',
      paymentMode: 'BANK',
      description: 'Network maintenance and server upgrade',
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-07-20'),
      status: 'COMPLETED',
      createdById: admin.id,
    },
    {
      serviceType: 'ELECTRICAL_INSTALLATION',
      clientName: 'Gakenke Secondary School',
      clientPhone: '+250 788 789 012',
      location: 'Gakenke',
      district: 'Gakenke',
      amount: 350000,
      amountPaid: 200000,
      paymentStatus: 'PARTIAL',
      paymentMode: 'MTN',
      description: 'Installation of new electrical wiring',
      startDate: new Date('2026-07-20'),
      endDate: new Date('2026-07-25'),
      status: 'ONGOING',
      createdById: worker.id,
    },
    {
      serviceType: 'DECORATION_SOUND',
      clientName: 'Muhabura Hotel',
      clientPhone: '+250 788 345 678',
      location: 'Gakenke',
      district: 'Gakenke',
      amount: 180000,
      amountPaid: 0,
      paymentStatus: 'UNPAID',
      paymentMode: 'CASH',
      description: 'Wedding decoration and sound system',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-02'),
      status: 'ONGOING',
      tentQuantity: 10,
      decorationItems: [
        { name: 'Flowers', quantity: 50 },
        { name: 'Chairs', quantity: 200 },
        { name: 'Tables', quantity: 20 },
      ],
      createdById: worker.id,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log(`✅ Created ${services.length} demo services`);

  // Create demo attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  await prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: worker.id,
        date: today,
      },
    },
    update: {},
    create: {
      userId: worker.id,
      date: today,
      status: 'PRESENT',
      checkInTime: new Date(),
    },
  });
  console.log(`✅ Created demo attendance`);

  // Create demo notification
  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: 'Welcome to AERA LTD System',
      message: 'Your system is ready to use. You can manage workers, services, and generate reports.',
      type: 'SYSTEM',
    },
  });
  console.log(`✅ Created demo notification`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });