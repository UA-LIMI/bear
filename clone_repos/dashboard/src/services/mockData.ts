// Mock data for the dashboard
// Guest Requests
export const mockRequests = [{
  id: 'req-001',
  roomNumber: '2104',
  guestName: 'James Wilson',
  type: 'room-service',
  status: 'pending',
  priority: 'high',
  timestamp: 'new Date(Date.now() - 15 * 60000).toISOString()',
  message: 'Could I get some extra towels and toiletries delivered to my room?',
  scheduled: false,
  assignedStaff: 'Maria Garcia',
  aiSuggestion: 'I\'ll arrange to have extra towels and toiletries delivered to your room right away, Mr. Wilson. Is there anything specific you need more of, such as shampoo or conditioner?',
  conversation: [{
    sender: 'guest',
    message: 'Could I get some extra towels and toiletries delivered to my room?',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString()
  }]
}, {
  id: 'req-002',
  roomNumber: '1802',
  guestName: 'Emma Thompson',
  type: 'food',
  status: 'in-progress',
  priority: 'normal',
  timestamp: 'new Date(Date.now() - 45 * 60000).toISOString()',
  message: 'I would like to order breakfast for tomorrow morning at 8am. Can I get the avocado toast and a cappuccino?',
  scheduled: true,
  assignedStaff: 'Carlos Rodriguez',
  aiSuggestion: 'Certainly, Ms. Thompson, I\'ll schedule your breakfast order for tomorrow at 8am. Based on your dietary preferences, I notice you enjoy vegetarian options. Would you like us to add some fresh seasonal fruit to accompany your avocado toast and cappuccino?',
  conversation: [{
    sender: 'guest',
    message: 'I would like to order breakfast for tomorrow morning at 8am. Can I get the avocado toast and a cappuccino?',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString()
  }, {
    sender: 'staff',
    message: 'Certainly Ms. Thompson, I\'ve scheduled your breakfast order for tomorrow at 8am. Would you like the breakfast delivered to your room or would you prefer to dine at our restaurant?',
    timestamp: 'new Date(Date.now() - 40 * 60000).toISOString()'
  }, {
    sender: 'guest',
    message: 'I\'d like it delivered to my room please.',
    timestamp: 'new Date(Date.now() - 35 * 60000).toISOString()'
  }]
}, {
  id: 'req-003',
  roomNumber: '1506',
  guestName: 'Michael Chen',
  type: 'transportation',
  status: 'completed',
  priority: 'normal',
  timestamp: 'new Date(Date.now() - 3 * 60 * 60000).toISOString()',
  message: 'Can you arrange a taxi to take me to the airport tomorrow at 10am?',
  scheduled: true,
  assignedStaff: 'Sarah Johnson',
  aiSuggestion: 'I\'ll arrange a taxi to pick you up at 10am tomorrow, Mr. Chen. Based on your destination being the airport and current traffic patterns, I recommend scheduling the pickup for 9:45am to ensure you arrive with sufficient time for check-in. Would you prefer a standard taxi or one of our executive car services?',
  conversation: [{
    sender: 'guest',
    message: 'Can you arrange a taxi to take me to the airport tomorrow at 10am?',
    timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString()
  }, {
    sender: 'staff',
    message: 'Of course, Mr. Chen. I\'ve arranged for a taxi to pick you up tomorrow at 10am. The driver will meet you at the front entrance. May I ask which airline you\'re flying with so we can ensure you arrive with plenty of time?',
    timestamp: 'new Date(Date.now() - 2.9 * 60 * 60000).toISOString()'
  }, {
    sender: 'guest',
    message: 'I\'m flying with Emirates, flight EK241.',
    timestamp: 'new Date(Date.now() - 2.8 * 60 * 60000).toISOString()'
  }, {
    sender: 'staff',
    message: 'Thank you for that information. Your taxi is confirmed for 10am tomorrow. The journey should take approximately 35 minutes, which will give you plenty of time for your Emirates flight. Is there anything else you need assistance with?',
    timestamp: new Date(Date.now() - 2.7 * 60 * 60000).toISOString()
  }]
}, {
  id: 'req-004',
  roomNumber: '2301',
  guestName: 'Sophia Rodriguez',
  type: 'housekeeping',
  status: 'pending',
  priority: 'normal',
  timestamp: 'new Date(Date.now() - 30 * 60000).toISOString()',
  message: 'The AC in my room seems to be not working properly. Can someone take a look?',
  scheduled: false,
  assignedStaff: 'Robert Kim',
  aiSuggestion: 'I apologize for the inconvenience with your AC, Ms. Rodriguez. I\'ll send our maintenance technician to your room immediately to assess and fix the issue. Based on your room\'s maintenance history, this may be related to a recent system update. Would you like us to offer you a temporary room change while we resolve this issue?',
  conversation: [{
    sender: 'guest',
    message: 'The AC in my room seems to be not working properly. Can someone take a look?',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString()
  }]
}, {
  id: 'req-005',
  roomNumber: '1904',
  guestName: 'David Johnson',
  type: 'amenities',
  status: 'pending',
  priority: 'low',
  timestamp: 'new Date(Date.now() - 60 * 60000).toISOString()',
  message: 'Could you recommend some good running routes near the hotel? I\'d like to go for a morning run tomorrow.',
  scheduled: false,
  assignedStaff: null,
  aiSuggestion: 'I\'d be happy to recommend some running routes, Mr. Johnson. Based on your fitness preferences, I suggest the Riverside Park trail which is 0.3 miles from our hotel - it\'s a 5-mile scenic loop with water stations along the way. We also have a detailed running map at the concierge desk, and our hotel offers complimentary running water bottles if you\'d like one prepared for your morning run.',
  conversation: [{
    sender: 'guest',
    message: 'Could you recommend some good running routes near the hotel? I\'d like to go for a morning run tomorrow.',
    timestamp: 'new Date(Date.now() - 60 * 60000).toISOString()'
  }]
}];
// Room Data
export const mockRooms = [{
  roomNumber: '2104',
  status: 'occupied',
  guestName: 'James Wilson',
  checkIn: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
  // 2 days ago
  checkOut: new Date(Date.now() + 3 * 24 * 60 * 60000).toISOString(),
  // 3 days from now
  temperature: 22,
  lights: true,
  doNotDisturb: false,
  acOn: true,
  curtainsOpen: true,
  housekeepingStatus: 'cleaned',
  minibarRestocked: true,
  maintenanceNeeded: false,
  guestSchedule: [{
    time: '7:30 AM',
    activity: 'Breakfast',
    notes: 'Room service'
  }, {
    time: '10:00 AM',
    activity: 'Spa Appointment',
    notes: 'Deep tissue massage'
  }, {
    time: '7:00 PM',
    activity: 'Dinner Reservation',
    notes: 'Hotel restaurant, table for 2'
  }]
}, {
  roomNumber: '1802',
  status: 'occupied',
  guestName: 'Emma Thompson',
  checkIn: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
  // 1 day ago
  checkOut: new Date(Date.now() + 5 * 24 * 60 * 60000).toISOString(),
  // 5 days from now
  temperature: 24,
  lights: false,
  doNotDisturb: true,
  acOn: true,
  curtainsOpen: false,
  housekeepingStatus: 'pending',
  minibarRestocked: false,
  maintenanceNeeded: false,
  guestSchedule: [{
    time: '8:00 AM',
    activity: 'Breakfast',
    notes: 'Room service'
  }, {
    time: '2:00 PM',
    activity: 'Business Meeting',
    notes: 'Hotel conference room'
  }]
}, {
  roomNumber: '1506',
  status: 'occupied',
  guestName: 'Michael Chen',
  checkIn: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
  // 4 days ago
  checkOut: new Date(Date.now() + 1 * 24 * 60 * 60000).toISOString(),
  // 1 day from now
  temperature: 21,
  lights: true,
  doNotDisturb: false,
  acOn: true,
  curtainsOpen: true,
  housekeepingStatus: 'cleaned',
  minibarRestocked: true,
  maintenanceNeeded: false,
  guestSchedule: [{
    time: '10:00 AM',
    activity: 'Airport Taxi',
    notes: 'Emirates flight EK241'
  }]
}, {
  roomNumber: '2301',
  status: 'occupied',
  guestName: 'Sophia Rodriguez',
  checkIn: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
  // 1 day ago
  checkOut: new Date(Date.now() + 4 * 24 * 60 * 60000).toISOString(),
  // 4 days from now
  temperature: 23,
  lights: true,
  doNotDisturb: false,
  acOn: false,
  // AC issue
  curtainsOpen: true,
  housekeepingStatus: 'cleaned',
  minibarRestocked: true,
  maintenanceNeeded: true,
  guestSchedule: []
}, {
  roomNumber: '1904',
  status: 'occupied',
  guestName: 'David Johnson',
  checkIn: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
  // 3 days ago
  checkOut: new Date(Date.now() + 2 * 24 * 60 * 60000).toISOString(),
  // 2 days from now
  temperature: 20,
  lights: false,
  doNotDisturb: false,
  acOn: true,
  curtainsOpen: false,
  housekeepingStatus: 'cleaned',
  minibarRestocked: true,
  maintenanceNeeded: false,
  guestSchedule: [{
    time: '6:00 AM',
    activity: 'Morning Run',
    notes: 'Requested route information'
  }]
}, {
  roomNumber: '1705',
  status: 'vacant',
  guestName: '',
  checkIn: null,
  checkOut: null,
  temperature: 22,
  lights: false,
  doNotDisturb: false,
  acOn: false,
  curtainsOpen: false,
  housekeepingStatus: 'cleaned',
  minibarRestocked: true,
  maintenanceNeeded: false,
  guestSchedule: []
}];
// Menu Items
export const mockMenuItems = [{
  id: 'menu-001',
  name: 'Avocado Toast',
  description: 'Sourdough toast topped with smashed avocado, poached eggs, and microgreens. Served with a side of roasted cherry tomatoes.',
  price: 18.50,
  category: 'Breakfast',
  available: true,
  preparationTime: 15,
  allergens: ['gluten', 'eggs'],
  dietaryInfo: 'vegetarian',
  image: 'https://images.unsplash.com/photo-1603046891744-76e6300f82ef'
}, {
  id: 'menu-002',
  name: 'Eggs Benedict',
  description: 'English muffin topped with Canadian bacon, poached eggs, and hollandaise sauce. Served with breakfast potatoes.',
  price: 22.00,
  category: 'Breakfast',
  available: true,
  preparationTime: 20,
  allergens: ['gluten', 'eggs', 'dairy'],
  dietaryInfo: 'none',
  image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7'
}, {
  id: 'menu-003',
  name: 'Lobster Risotto',
  description: 'Creamy Arborio rice with butter-poached lobster, finished with mascarpone cheese and fresh herbs.',
  price: 42.00,
  category: 'Dinner',
  available: true,
  preparationTime: 30,
  allergens: ['shellfish', 'dairy'],
  dietaryInfo: 'none',
  image: 'https://images.unsplash.com/photo-1633436375153-d7045cb61590'
}, {
  id: 'menu-004',
  name: 'Wagyu Beef Burger',
  description: 'Premium Wagyu beef patty with aged cheddar, caramelized onions, and truffle aioli on a brioche bun. Served with hand-cut fries.',
  price: 36.00,
  category: 'Lunch',
  available: false,
  preparationTime: 25,
  allergens: ['gluten', 'dairy'],
  dietaryInfo: 'none',
  image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b'
}, {
  id: 'menu-005',
  name: 'Signature Martini',
  description: 'Premium vodka or gin with dry vermouth, served with your choice of olives or a lemon twist.',
  price: 24.00,
  category: 'Drinks',
  available: true,
  preparationTime: 5,
  allergens: [],
  dietaryInfo: 'vegan',
  image: 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39'
}, {
  id: 'menu-006',
  name: 'Chocolate Soufflé',
  description: 'Warm chocolate soufflé with a molten center, served with vanilla bean ice cream and raspberry coulis.',
  price: 16.00,
  category: 'Desserts',
  available: true,
  preparationTime: 25,
  allergens: ['gluten', 'dairy', 'eggs'],
  dietaryInfo: 'vegetarian',
  image: 'https://images.unsplash.com/photo-1611329695518-1763fc6d16f3'
}, {
  id: 'menu-007',
  name: 'Truffle Fries',
  description: 'Hand-cut fries tossed with truffle oil, parmesan cheese, and fresh herbs.',
  price: 14.00,
  category: 'Lunch',
  available: true,
  preparationTime: 15,
  allergens: ['dairy'],
  dietaryInfo: 'vegetarian',
  image: 'https://images.unsplash.com/photo-1639744093378-d01affe6ffdf'
}];
// Knowledge Base
export const mockKnowledgeBase = [{
  id: 'kb-001',
  title: 'Swimming Pool Hours',
  category: 'Operating Hours',
  content: 'The main swimming pool is open daily from 6:00 AM to 10:00 PM. The adults-only infinity pool on the rooftop is open from 8:00 AM to 8:00 PM. Pool towels are provided at the pool deck. Private swimming lessons can be arranged through the concierge with at least 24 hours notice.',
  lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString() // 7 days ago
}, {
  id: 'kb-002',
  title: 'Spa Services',
  category: 'Hotel Facilities',
  content: 'Our luxury spa offers a range of treatments including massages, facials, body treatments, and nail services. The spa is open daily from 9:00 AM to 9:00 PM. Advance reservations are recommended and can be made through the concierge or directly with the spa. A 24-hour cancellation policy applies to all spa appointments.',
  lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60000).toISOString() // 14 days ago
}, {
  id: 'kb-003',
  title: 'Museum of Modern Art',
  category: 'Local Attractions',
  content: 'The Museum of Modern Art is located 2.5 miles from the hotel. It features an extensive collection of modern and contemporary art. Open Tuesday through Sunday from 10:00 AM to 5:30 PM, closed on Mondays. The hotel offers a complimentary shuttle service to the museum at 10:00 AM and 2:00 PM daily. Return shuttles depart from the museum at 1:30 PM and 5:45 PM.',
  lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString() // 30 days ago
}, {
  id: 'kb-004',
  title: 'Annual Jazz Festival',
  category: 'Events',
  content: 'The city\'s Annual Jazz Festival will take place from July 15-18 this year. The main stage is located at Central Park, approximately 1.5 miles from the hotel. Performances run from 2:00 PM to 10:00 PM daily. VIP tickets are available for purchase through the concierge service with a 10% discount for hotel guests.',
  lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString() // 5 days ago
}, {
  id: 'kb-005',
  title: 'Rooftop Restaurant',
  category: 'Dining',
  content: 'Our signature rooftop restaurant offers panoramic city views and a menu featuring contemporary fusion cuisine. The restaurant is open for dinner only, from 6:00 PM to 11:00 PM, Tuesday through Sunday (closed on Mondays). Reservations are strongly recommended and can be made up to 30 days in advance. Smart casual dress code is enforced.',
  lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString() // 2 days ago
}, {
  id: 'kb-006',
  title: 'Airport Transportation',
  category: 'Transportation',
  content: 'The hotel offers luxury car service to and from the international airport, located 22 miles away. The journey typically takes 35-45 minutes depending on traffic. Rates are $120 one-way or $220 round-trip. Please arrange with the concierge at least 4 hours before your desired pickup time. For last-minute requests, we can arrange taxi service with approximately 15-20 minutes notice.',
  lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString() // 10 days ago
}, {
  id: 'kb-007',
  title: 'Fitness Center',
  category: 'Hotel Facilities',
  content: 'Our state-of-the-art fitness center is located on the 3rd floor and is accessible 24/7 with your room key. The center features cardio equipment, free weights, and weight machines. Personal training sessions can be booked through the concierge with at least 12 hours notice. Complimentary yoga classes are offered daily at 7:00 AM in the adjacent studio.',
  lastUpdated: new Date(Date.now() - 45 * 24 * 60 * 60000).toISOString() // 45 days ago
}];
// Staff Profiles
export const mockStaffProfiles = [{
  id: 'staff-001',
  name: 'Maria Garcia',
  position: 'Concierge Manager',
  department: 'Concierge',
  email: 'maria.garcia@luxhotel.com',
  phone: '+1 (555) 123-4567',
  photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces',
  joinDate: '2019-04-15',
  status: 'on duty',
  shift: '7:00 AM - 3:30 PM',
  performance: 98,
  notes: 'Fluent in Spanish, French, and Italian. Exceptional knowledge of local attractions and restaurants. Preferred by VIP guests.',
  skills: [{
    name: 'Guest Relations',
    level: 98
  }, {
    name: 'Local Knowledge',
    level: 95
  }, {
    name: 'Problem Solving',
    level: 92
  }, {
    name: 'Languages',
    level: 96
  }, {
    name: 'VIP Services',
    level: 99
  }],
  schedule: [{
    day: 'Monday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Tuesday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Wednesday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Thursday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Friday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Saturday',
    working: false,
    hours: ''
  }, {
    day: 'Sunday',
    working: false,
    hours: ''
  }],
  currentAssignments: [{
    id: 'task-001',
    title: 'VIP Airport Pickup',
    description: 'Arrange luxury car service for platinum member Emma Thompson arriving at 2:30 PM',
    type: 'request',
    status: 'in progress',
    dueDate: new Date(Date.now() + 4 * 60 * 60000).toISOString(),
    guest: 'Emma Thompson',
    room: '1802',
    aiGuidance: 'Ms. Thompson prefers Audi or Mercedes vehicles based on previous stays. Ensure the driver has still water available in the vehicle.'
  }, {
    id: 'task-002',
    title: 'Restaurant Reservation',
    description: 'Book table for 2 at Le Bistro for James Wilson at 7:00 PM',
    type: 'request',
    status: 'pending',
    dueDate: new Date(Date.now() + 8 * 60 * 60000).toISOString(),
    guest: 'James Wilson',
    room: '2104',
    aiGuidance: 'Mr. Wilson typically prefers window seating away from the kitchen. Request table 15 or 22 if available.'
  }],
  metrics: {
    guestSatisfaction: 98,
    guestSatisfactionTrend: 'up',
    taskEfficiency: 95,
    taskEfficiencyTrend: 'up',
    totalTasks: 245,
    tasksOnTime: 238,
    avgResolutionTime: 14,
    responseRate: 99,
    ratings: [1, 0, 4, 12, 83]
  },
  aiInsights: {
    performance: 'Maria consistently exceeds expectations with exceptional guest satisfaction scores. Her multilingual abilities and extensive knowledge of local attractions make her particularly valuable for international guests.',
    strengths: ['Exceptional at anticipating guest needs before they arise', 'Strong problem-solving skills, resolving 98% of issues without escalation', 'Multilingual capabilities that enhance guest experiences', 'Detailed knowledge of local attractions and exclusive venues'],
    improvementAreas: ['Could benefit from cross-training in the reservations system', 'Opportunity to develop mentoring skills for junior staff']
  },
  recentFeedback: [{
    guestName: 'Richard Branson',
    rating: 5,
    date: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    comment: 'Maria went above and beyond to make our stay special. Her restaurant recommendations were perfect!'
  }, {
    guestName: 'Sophia Chen',
    rating: 5,
    date: new Date(Date.now() - 14 * 24 * 60 * 60000).toISOString(),
    comment: 'Exceptional service. Maria arranged a last-minute helicopter tour that became the highlight of our trip.'
  }],
  aiRecommendations: [{
    title: 'Assign to upcoming CEO visit',
    description: 'Based on Maria\'s exceptional performance with VIP guests, she would be ideal to handle the upcoming visit from the Hilton CEO next month.',
    priority: 'medium'
  }, {
    title: 'Conduct staff training session',
    description: 'Maria\'s knowledge of local attractions and restaurants could be valuable for other staff. Consider scheduling her to lead a training session.',
    priority: 'low'
  }]
}, {
  id: 'staff-002',
  name: 'Robert Kim',
  position: 'Maintenance Supervisor',
  department: 'Maintenance',
  email: 'robert.kim@luxhotel.com',
  phone: '+1 (555) 987-6543',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
  joinDate: '2017-08-22',
  status: 'on duty',
  shift: '6:00 AM - 2:30 PM',
  performance: 94,
  notes: 'Certified HVAC technician. Expert in building automation systems. Excellent at preventive maintenance scheduling.',
  skills: [{
    name: 'HVAC Systems',
    level: 98
  }, {
    name: 'Electrical Systems',
    level: 95
  }, {
    name: 'Plumbing',
    level: 90
  }, {
    name: 'Building Automation',
    level: 96
  }, {
    name: 'Preventive Maintenance',
    level: 97
  }],
  schedule: [{
    day: 'Monday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Tuesday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Wednesday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Thursday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Friday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Saturday',
    working: false,
    hours: ''
  }, {
    day: 'Sunday',
    working: false,
    hours: ''
  }],
  currentAssignments: [{
    id: 'task-003',
    title: 'Room 2301 AC Repair',
    description: 'Fix air conditioning unit in Room 2301 reported by guest Sophia Rodriguez',
    type: 'maintenance',
    status: 'in progress',
    dueDate: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
    guest: 'Sophia Rodriguez',
    room: '2301',
    aiGuidance: 'This unit has had thermostat issues in the past. Check the calibration first before replacing components.'
  }, {
    id: 'task-004',
    title: 'Preventive Maintenance',
    description: 'Perform scheduled maintenance on 15th floor HVAC system',
    type: 'maintenance',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60000).toISOString(),
    guest: null,
    room: null
  }],
  metrics: {
    guestSatisfaction: 92,
    guestSatisfactionTrend: 'up',
    taskEfficiency: 94,
    taskEfficiencyTrend: 'up',
    totalTasks: 312,
    tasksOnTime: 298,
    avgResolutionTime: 42,
    responseRate: 97,
    ratings: [2, 1, 5, 20, 72]
  },
  aiInsights: {
    performance: 'Robert consistently resolves maintenance issues quickly and effectively, with a focus on preventive maintenance that has reduced emergency calls by 34% year-over-year.',
    strengths: ['Exceptional technical knowledge of building systems', 'Proactive approach to maintenance reduces emergency repairs', 'Efficient troubleshooting skills minimize guest disruption', 'Strong documentation practices improve system reliability'],
    improvementAreas: ['Could enhance guest communication during maintenance visits', 'Opportunity to develop junior maintenance staff through more structured mentoring']
  },
  recentFeedback: [{
    guestName: 'David Johnson',
    rating: 5,
    date: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
    comment: 'Robert fixed the shower issue in my room within 15 minutes of reporting it. Very professional and efficient.'
  }, {
    guestName: 'Jennifer Liu',
    rating: 4,
    date: new Date(Date.now() - 12 * 24 * 60 * 60000).toISOString(),
    comment: 'Quick response to the AC problem. Would have appreciated more explanation about what was done.'
  }],
  aiRecommendations: [{
    title: 'Implement new preventive maintenance schedule',
    description: 'Based on Robert\'s analysis, implementing his proposed quarterly HVAC maintenance schedule could reduce energy costs by 12%.',
    priority: 'high'
  }, {
    title: 'Training on new smart room technology',
    description: 'Schedule Robert for the upcoming smart room technology certification to prepare for the 5th floor renovation.',
    priority: 'medium'
  }]
}, {
  id: 'staff-003',
  name: 'Sarah Johnson',
  position: 'Front Desk Manager',
  department: 'Front Desk',
  email: 'sarah.johnson@luxhotel.com',
  phone: '+1 (555) 234-5678',
  photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
  joinDate: '2020-02-10',
  status: 'on duty',
  shift: '8:00 AM - 4:30 PM',
  performance: 96,
  notes: 'Excellent at managing high-pressure situations. Strong leadership skills. Implemented new check-in process that reduced wait times by 40%.',
  skills: [{
    name: 'Guest Check-in/out',
    level: 99
  }, {
    name: 'Conflict Resolution',
    level: 97
  }, {
    name: 'Team Leadership',
    level: 95
  }, {
    name: 'Upselling',
    level: 92
  }, {
    name: 'Process Optimization',
    level: 94
  }],
  schedule: [{
    day: 'Monday',
    working: true,
    hours: '8:00 AM - 4:30 PM'
  }, {
    day: 'Tuesday',
    working: true,
    hours: '8:00 AM - 4:30 PM'
  }, {
    day: 'Wednesday',
    working: true,
    hours: '8:00 AM - 4:30 PM'
  }, {
    day: 'Thursday',
    working: true,
    hours: '8:00 AM - 4:30 PM'
  }, {
    day: 'Friday',
    working: true,
    hours: '8:00 AM - 4:30 PM'
  }, {
    day: 'Saturday',
    working: false,
    hours: ''
  }, {
    day: 'Sunday',
    working: false,
    hours: ''
  }],
  currentAssignments: [{
    id: 'task-005',
    title: 'VIP Check-out Process',
    description: 'Handle express check-out for Michael Chen, ensuring all transportation arrangements are confirmed',
    type: 'guest',
    status: 'pending',
    dueDate: new Date(Date.now() + 16 * 60 * 60000).toISOString(),
    guest: 'Michael Chen',
    room: '1506',
    aiGuidance: 'Mr. Chen typically prefers email receipts and has requested airport transportation. Verify his Emirates flight details before arranging the taxi.'
  }],
  metrics: {
    guestSatisfaction: 96,
    guestSatisfactionTrend: 'up',
    taskEfficiency: 93,
    taskEfficiencyTrend: 'up',
    totalTasks: 423,
    tasksOnTime: 410,
    avgResolutionTime: 8,
    responseRate: 99,
    ratings: [1, 2, 3, 14, 80]
  },
  aiInsights: {
    performance: 'Sarah has transformed the front desk operations with her leadership, resulting in faster check-ins and significantly improved guest satisfaction scores for arrival experiences.',
    strengths: ['Exceptional at managing peak check-in/out periods efficiently', 'Strong team leadership that improves overall department performance', 'Skilled at resolving guest concerns at first contact', 'Effective at recognizing and accommodating returning guests'],
    improvementAreas: ['Could develop more cross-departmental collaboration skills', 'Opportunity to improve room upgrade conversion rate']
  },
  recentFeedback: [{
    guestName: 'Thomas Williams',
    rating: 5,
    date: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    comment: 'Sarah made our arrival so smooth and remembered us from our previous stay. Impressive service!'
  }, {
    guestName: 'Maria Gonzalez',
    rating: 5,
    date: new Date(Date.now() - 9 * 24 * 60 * 60000).toISOString(),
    comment: 'Despite arriving during a busy time, Sarah ensured we were checked in quickly and made us feel welcome.'
  }],
  aiRecommendations: [{
    title: 'Implement mobile check-in pilot',
    description: 'Sarah\'s front desk expertise would be valuable in supervising the upcoming mobile check-in technology pilot program.',
    priority: 'high'
  }, {
    title: 'Lead staff training on upselling',
    description: 'Based on Sarah\'s successful upselling techniques, schedule her to conduct a training session for all front desk staff.',
    priority: 'medium'
  }]
}, {
  id: 'staff-004',
  name: 'Carlos Rodriguez',
  position: 'Food & Beverage Supervisor',
  department: 'Food & Beverage',
  email: 'carlos.rodriguez@luxhotel.com',
  phone: '+1 (555) 876-5432',
  photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces',
  joinDate: '2018-06-12',
  status: 'on duty',
  shift: '6:00 AM - 2:30 PM',
  performance: 91,
  notes: 'Certified sommelier. Strong knowledge of dietary restrictions and allergens. Excellent at training new staff.',
  skills: [{
    name: 'Food Service',
    level: 94
  }, {
    name: 'Wine Knowledge',
    level: 98
  }, {
    name: 'Staff Training',
    level: 92
  }, {
    name: 'Dietary Accommodations',
    level: 95
  }, {
    name: 'Inventory Management',
    level: 90
  }],
  schedule: [{
    day: 'Monday',
    working: false,
    hours: ''
  }, {
    day: 'Tuesday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Wednesday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Thursday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Friday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Saturday',
    working: true,
    hours: '6:00 AM - 2:30 PM'
  }, {
    day: 'Sunday',
    working: false,
    hours: ''
  }],
  currentAssignments: [{
    id: 'task-006',
    title: 'Special Breakfast Order',
    description: 'Oversee preparation of vegetarian breakfast for Emma Thompson, room 1802',
    type: 'request',
    status: 'in progress',
    dueDate: new Date(Date.now() + 18 * 60 * 60000).toISOString(),
    guest: 'Emma Thompson',
    room: '1802',
    aiGuidance: 'Ms. Thompson has previously enjoyed our avocado toast with extra heirloom tomatoes. She prefers oat milk in her cappuccino.'
  }, {
    id: 'task-007',
    title: 'Wine Pairing for VIP Dinner',
    description: 'Select wine pairings for James Wilson\'s dinner reservation at the hotel restaurant',
    type: 'request',
    status: 'pending',
    dueDate: new Date(Date.now() + 10 * 60 * 60000).toISOString(),
    guest: 'James Wilson',
    room: '2104',
    aiGuidance: 'Mr. Wilson has shown preference for full-bodied red wines in past visits, particularly Napa Valley Cabernets.'
  }],
  metrics: {
    guestSatisfaction: 93,
    guestSatisfactionTrend: 'up',
    taskEfficiency: 89,
    taskEfficiencyTrend: 'down',
    totalTasks: 378,
    tasksOnTime: 352,
    avgResolutionTime: 22,
    responseRate: 95,
    ratings: [2, 3, 6, 18, 71]
  },
  aiInsights: {
    performance: 'Carlos excels in food and beverage knowledge, particularly in wine expertise and dietary accommodations, which has resulted in consistently high dining satisfaction scores.',
    strengths: ['Exceptional wine knowledge that enhances guest dining experiences', 'Skilled at accommodating complex dietary requirements', 'Strong attention to detail in food presentation and quality', 'Effective at anticipating guest preferences based on past visits'],
    improvementAreas: ['Could improve task completion timeliness during peak periods', 'Opportunity to enhance inventory management to reduce waste']
  },
  recentFeedback: [{
    guestName: 'Emma Thompson',
    rating: 5,
    date: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    comment: 'Carlos recommended the perfect wine pairing for our dinner. His knowledge made the meal exceptional.'
  }, {
    guestName: 'Robert Chen',
    rating: 4,
    date: new Date(Date.now() - 8 * 24 * 60 * 60000).toISOString(),
    comment: 'Great service, though our breakfast arrived slightly later than requested.'
  }],
  aiRecommendations: [{
    title: 'Update seasonal menu',
    description: 'Based on Carlos\'s guest preference analysis, incorporate his suggested seasonal menu changes for fall.',
    priority: 'medium'
  }, {
    title: 'Implement new dietary tracking system',
    description: 'Carlos\'s expertise in dietary accommodations would be valuable in implementing the new guest preference tracking system.',
    priority: 'low'
  }]
}, {
  id: 'staff-005',
  name: 'Aisha Patel',
  position: 'Housekeeping Supervisor',
  department: 'Housekeeping',
  email: 'aisha.patel@luxhotel.com',
  phone: '+1 (555) 345-6789',
  photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
  joinDate: '2019-11-05',
  status: 'on break',
  shift: '7:00 AM - 3:30 PM',
  performance: 95,
  notes: 'Excellent attention to detail. Implemented eco-friendly cleaning practices. Strong team leader who maintains high standards.',
  skills: [{
    name: 'Room Inspection',
    level: 98
  }, {
    name: 'Team Coordination',
    level: 94
  }, {
    name: 'Inventory Management',
    level: 92
  }, {
    name: 'Sustainable Practices',
    level: 97
  }, {
    name: 'Guest Privacy',
    level: 99
  }],
  schedule: [{
    day: 'Monday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Tuesday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Wednesday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Thursday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Friday',
    working: true,
    hours: '7:00 AM - 3:30 PM'
  }, {
    day: 'Saturday',
    working: false,
    hours: ''
  }, {
    day: 'Sunday',
    working: false,
    hours: ''
  }],
  currentAssignments: [{
    id: 'task-008',
    title: 'VIP Room Preparation',
    description: 'Oversee special preparation of suite for incoming platinum member',
    type: 'guest',
    status: 'completed',
    dueDate: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    guest: 'Emma Thompson',
    room: '1802'
  }, {
    id: 'task-009',
    title: 'Room Deep Cleaning',
    description: 'Schedule and oversee deep cleaning of recently vacated rooms on the 17th floor',
    type: 'maintenance',
    status: 'in progress',
    dueDate: new Date(Date.now() + 5 * 60 * 60000).toISOString(),
    guest: null,
    room: null,
    aiGuidance: 'Focus on rooms 1705-1712 which have been occupied for extended stays and will need extra attention to carpets and bathrooms.'
  }],
  metrics: {
    guestSatisfaction: 96,
    guestSatisfactionTrend: 'up',
    taskEfficiency: 94,
    taskEfficiencyTrend: 'up',
    totalTasks: 412,
    tasksOnTime: 399,
    avgResolutionTime: 32,
    responseRate: 98,
    ratings: [0, 1, 3, 16, 80]
  },
  aiInsights: {
    performance: 'Aisha has transformed the housekeeping department with her attention to detail and eco-friendly initiatives, resulting in both higher guest satisfaction and reduced operational costs.',
    strengths: ['Exceptional room inspection standards that catch issues before guests arrive', 'Innovative implementation of sustainable cleaning practices', 'Effective team leadership that maintains consistent quality', 'Strong inventory management that reduces waste and costs'],
    improvementAreas: ['Could improve coordination with maintenance for faster issue resolution', 'Opportunity to develop digital documentation skills with new room inspection app']
  },
  recentFeedback: [{
    guestName: 'James Wilson',
    rating: 5,
    date: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
    comment: 'The room was immaculate, and I appreciated the eco-friendly amenities. Excellent housekeeping!'
  }, {
    guestName: 'Sophia Rodriguez',
    rating: 5,
    date: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(),
    comment: 'I have severe allergies, and the special cleaning done for my room made a huge difference in my stay. Thank you!'
  }],
  aiRecommendations: [{
    title: 'Expand eco-friendly initiative',
    description: 'Aisha\'s successful pilot of eco-friendly cleaning supplies should be expanded hotel-wide, with her leading the implementation.',
    priority: 'medium'
  }, {
    title: 'Develop allergen-free room program',
    description: 'Based on Aisha\'s expertise with special cleaning protocols, develop a formal allergen-free room program under her guidance.',
    priority: 'high'
  }]
}];
// Mock notifications
export const mockNotifications = [{
  id: 'notif-001',
  type: 'request',
  title: 'New Guest Request',
  message: 'James Wilson in Room 2104 has requested extra towels and toiletries.',
  timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  read: false,
  requestId: 'req-001',
  sender: 'System'
}, {
  id: 'notif-002',
  type: 'alert',
  title: 'Maintenance Alert',
  message: 'AC unit in Room 2301 requires immediate attention.',
  timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
  read: false,
  roomNumber: '2301',
  sender: 'System'
}, {
  id: 'notif-003',
  type: 'room',
  title: 'VIP Check-in',
  message: 'Platinum member Emma Thompson will be arriving in 2 hours.',
  timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
  read: true,
  guestId: 'guest-002',
  sender: 'System'
}, {
  id: 'notif-004',
  type: 'system',
  title: 'System Update',
  message: 'Hotel management system will undergo maintenance tonight at 2:00 AM.',
  timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
  read: true,
  sender: 'IT Department'
}, {
  id: 'notif-005',
  type: 'success',
  title: 'Task Completed',
  message: 'Room 1802 has been prepared for VIP guest arrival.',
  timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
  read: false,
  roomNumber: '1802',
  sender: 'Aisha Patel'
}];
// Add AI summaries to guest profiles
export const mockGuestAISummaries = {
  'guest-001': {
    overview: 'James Wilson is a high-value Gold tier guest with 5 previous stays who appreciates personalized service and attention to detail. He typically stays for business purposes but often extends for leisure.',
    preferences: ['Prefers high floors with city views, away from elevators', 'Consistently orders room service breakfast (eggs benedict and black coffee)', 'Enjoys the spa facilities, particularly massage treatments', 'Values efficient check-in/out process and minimal disruptions', 'Has a strong preference for sparkling water (San Pellegrino specifically)'],
    spendingPatterns: 'Typically spends 35% above average guest in F&B, with particular focus on fine dining and premium wines. Regularly uses spa services and room service.',
    loyaltyInsights: 'On track to reach Platinum status within next 2 stays. Has referred 3 business associates to the hotel in the past year.',
    recommendations: [{
      title: 'Personalized Wine Tasting',
      description: 'Based on Mr. Wilson\'s wine preferences and spending patterns, offer a complimentary private wine tasting with our sommelier featuring Napa Valley Cabernets.',
      impact: 'high'
    }, {
      title: 'Platinum Status Fast-Track',
      description: 'Offer accelerated path to Platinum status with this stay plus enrollment in our business referral program.',
      impact: 'medium'
    }, {
      title: 'Executive Suite Upgrade',
      description: 'Current occupancy allows for an upgrade to an Executive Suite, which aligns with preference for spacious accommodations.',
      impact: 'high'
    }],
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString()
  },
  'guest-002': {
    overview: 'Emma Thompson is one of our most loyal Platinum members with 12 stays over the past 3 years. She values cultural experiences, privacy, and attentive but unobtrusive service.',
    preferences: ['Strictly vegetarian with nut and dairy allergies that require careful attention', 'Prefers quiet rooms with city views and extra blankets', 'Avid art enthusiast who appreciates cultural recommendations', 'Typically requests herbal tea (chamomile or mint) rather than coffee', 'Values sustainability initiatives and eco-friendly practices'],
    spendingPatterns: 'Moderate F&B spending focused on in-room dining and afternoon tea. Higher than average expenditure on cultural experiences and local tours arranged through concierge.',
    loyaltyInsights: 'Extremely loyal guest who has maintained Platinum status for 2 consecutive years. Frequently leaves positive reviews on luxury travel platforms.',
    recommendations: [{
      title: 'Personalized Art Experience',
      description: 'Arrange private viewing at the Museum of Modern Art\'s new exhibition opening this weekend, based on Ms. Thompson\'s documented interest in contemporary art.',
      impact: 'high'
    }, {
      title: 'Custom Herbal Tea Selection',
      description: 'Prepare a custom in-room herbal tea selection featuring premium organic varieties based on her previous selections.',
      impact: 'medium'
    }, {
      title: 'Vegetarian Chef\'s Table Experience',
      description: 'Offer exclusive vegetarian chef\'s table experience with our executive chef, accommodating her dietary restrictions.',
      impact: 'high'
    }],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString()
  },
  'guest-003': {
    overview: 'Michael Chen is a frequent business traveler who values efficiency, consistency, and functional amenities. His stays are typically short (3-4 days) but frequent throughout the year.',
    preferences: ['Business-focused amenities: reliable WiFi, desk space, and convenient power outlets', 'Prefers quick, efficient service with minimal interaction', 'Regular gym user, typically in early mornings (5:30-6:30 AM)', 'Early riser who often requests early check-in when available', 'Appreciates transportation assistance, particularly for airport transfers'],
    spendingPatterns: 'Below average on F&B but consistent with room service for late-night meals. Minimal use of additional services except for transportation and occasional dry cleaning.',
    loyaltyInsights: 'Currently at Silver tier with potential to reach Gold within 2-3 stays. Loyalty driven primarily by location and consistency of experience.',
    recommendations: [{
      title: 'Express Business Package',
      description: 'Offer business package including guaranteed early check-in, breakfast, airport transfer, and premium WiFi at a bundled rate.',
      impact: 'high'
    }, {
      title: 'Digital Key Access',
      description: 'Enroll Mr. Chen in our digital key pilot program allowing smartphone room access, aligning with his preference for efficiency.',
      impact: 'medium'
    }, {
      title: 'Personal Trainer Session',
      description: 'Complimentary early morning personal training session based on his consistent gym usage pattern.',
      impact: 'low'
    }],
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString()
  }
};