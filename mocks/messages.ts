import { Message, Conversation } from '@/types';

export const mockMessages: Message[] = [
  // Conversation between Alex (101) and Maria (1)
  {
    id: '1',
    senderId: '101', // customer Alex
    receiverId: '1', // cook Maria
    content: "Hi Maria, I've reserved your enchiladas for tonight. Is it okay if I pick them up at 6:30pm instead of 6pm?",
    createdAt: '2025-07-10T14:30:00Z',
    read: true
  },
  {
    id: '2',
    senderId: '1', // cook Maria
    receiverId: '101', // customer Alex
    content: "Hi Alex! Yes, 6:30pm works fine. I'll have your order ready. See you then!",
    createdAt: '2025-07-10T14:45:00Z',
    read: true
  },
  {
    id: '3',
    senderId: '101', // customer Alex
    receiverId: '1', // cook Maria
    content: "Great, thank you! Looking forward to trying your enchiladas.",
    createdAt: '2025-07-10T14:50:00Z',
    read: false
  },
  
  // Conversation between Emily (102) and Priya (3)
  {
    id: '4',
    senderId: '102', // customer Emily
    receiverId: '3', // cook Priya
    content: "Hello Priya, I've made a reservation for your butter chicken tomorrow. Do I need to bring my own container?",
    createdAt: '2025-07-10T15:10:00Z',
    read: true
  },
  {
    id: '5',
    senderId: '3', // cook Priya
    receiverId: '102', // customer Emily
    content: "Hi Emily! No need to bring a container, I'll provide everything. See you tomorrow!",
    createdAt: '2025-07-10T15:25:00Z',
    read: false
  },
  
  // Conversation between Michael (103) and James (2)
  {
    id: '6',
    senderId: '103', // customer Michael
    receiverId: '2', // cook James
    content: "Hi James! I'm interested in your dim sum platter. Is it still available for pickup today?",
    createdAt: '2025-07-10T16:00:00Z',
    read: true
  },
  {
    id: '7',
    senderId: '2', // cook James
    receiverId: '103', // customer Michael
    content: "Hello Michael! Yes, I still have 2 portions available. Would you like to reserve one?",
    createdAt: '2025-07-10T16:15:00Z',
    read: true
  },
  {
    id: '8',
    senderId: '103', // customer Michael
    receiverId: '2', // cook James
    content: "Perfect! I'd like to reserve one portion. What time works best for pickup?",
    createdAt: '2025-07-10T16:20:00Z',
    read: true
  },
  {
    id: '9',
    senderId: '2', // cook James
    receiverId: '103', // customer Michael
    content: "How about 12:30pm? I'll have it ready for you.",
    createdAt: '2025-07-10T16:25:00Z',
    read: false
  },
  
  // Conversation between Alex (101) and David (5)
  {
    id: '10',
    senderId: '101', // customer Alex
    receiverId: '5', // cook David
    content: "Hi David! Your Korean BBQ bowl looks amazing. Is it very spicy?",
    createdAt: '2025-07-10T17:00:00Z',
    read: true
  },
  {
    id: '11',
    senderId: '5', // cook David
    receiverId: '101', // customer Alex
    content: "Hi Alex! It has a mild to medium spice level. I can make it less spicy if you prefer!",
    createdAt: '2025-07-10T17:10:00Z',
    read: false
  },
  
  // Conversation between Emily (102) and Sofia (4)
  {
    id: '12',
    senderId: '102', // customer Emily
    receiverId: '4', // cook Sofia
    content: "Hi Sofia! I love Italian food. Do you have any vegetarian options available?",
    createdAt: '2025-07-10T18:00:00Z',
    read: true
  },
  {
    id: '13',
    senderId: '4', // cook Sofia
    receiverId: '102', // customer Emily
    content: "Ciao Emily! Yes, I make an amazing vegetarian lasagna with ricotta and spinach. Would you be interested?",
    createdAt: '2025-07-10T18:15:00Z',
    read: false
  }
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: ['101', '1'], // customer Alex and cook Maria
    lastMessage: mockMessages[2], // "Great, thank you! Looking forward to trying your enchiladas."
    unreadCount: 1
  },
  {
    id: '2',
    participants: ['102', '3'], // customer Emily and cook Priya
    lastMessage: mockMessages[4], // "Hi Emily! No need to bring a container..."
    unreadCount: 1
  },
  {
    id: '3',
    participants: ['103', '2'], // customer Michael and cook James
    lastMessage: mockMessages[8], // "How about 12:30pm? I'll have it ready for you."
    unreadCount: 1
  },
  {
    id: '4',
    participants: ['101', '5'], // customer Alex and cook David
    lastMessage: mockMessages[10], // "Hi Alex! It has a mild to medium spice level..."
    unreadCount: 1
  },
  {
    id: '5',
    participants: ['102', '4'], // customer Emily and cook Sofia
    lastMessage: mockMessages[12], // "Ciao Emily! Yes, I make an amazing vegetarian lasagna..."
    unreadCount: 1
  }
];