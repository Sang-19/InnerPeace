# InnerPeace

A comprehensive digital mental health and psychological support system designed specifically for students. InnerPeace provides a safe, accessible platform for students to track their mental wellness, access AI-powered support, and connect with peers while ensuring administrators can monitor and intervene when necessary.

## Features

### For Students
- **AI Chatbot Support**: 24/7 conversational support through "Peace Pal", an AI-powered chatbot that provides guidance and assistance
- **Mood Tracking**: Daily mood logging with visual trends and insights
- **Community Chat**: Safe peer-to-peer communication with moderation and reporting capabilities
- **Relaxation Exercises**: Guided mindfulness and breathing exercises for stress relief
- **Emergency Alerts**: One-click emergency notification system that alerts administrators and provides location data
- **Personalized Support**: Daily support questions and inspirational content

### For Administrators
- **Student Management**: Comprehensive student list with profile information and mental health status tracking
- **Community Monitoring**: Advanced reporting system with admin approval workflow for community messages
- **Emergency Response**: Real-time emergency alerts with location tracking
- **Analytics Dashboard**: Key metrics including student count, pending alerts, and reports
- **Feedback Management**: Collect and review student feedback for continuous improvement

### Security & Moderation
- **Role-Based Access**: Secure authentication with distinct admin and student roles
- **Community Reporting**: Transparent reporting system requiring admin review before content removal
- **Audit Trail**: Full logging of moderation decisions and emergency responses
- **Data Privacy**: Secure handling of user data with Firebase backend

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI**: Google AI (Gemini) via Genkit for chatbot functionality
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: React Context for authentication
- **Deployment**: Firebase Hosting

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Soumyajit0404/IP_test.git
cd IP_test
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication and Firestore
   - Copy your Firebase config to `.env.local`

4. Configure environment variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:9003](http://localhost:9003) in your browser

### Development Scripts

- `npm run dev` - Start development server
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── ai/                    # AI flows and Genkit configuration
├── app/                   # Next.js app router pages
│   ├── admin/            # Admin dashboard pages
│   ├── student/          # Student dashboard pages
│   └── api/              # API routes
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── student/         # Student-specific components
│   ├── auth/            # Authentication components
│   └── ui/              # Base UI components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
│   ├── firebase/        # Firebase configuration
│   └── utils/           # Helper functions
└── types.ts             # TypeScript type definitions
```

## Key Components

### AI Chatbot (`Peace Pal`)
- Powered by Google Gemini AI
- Provides 24/7 emotional support and guidance
- Integrated with emergency contact information for crisis detection

### Mood Tracking System
- Simple emoji-based mood selection
- Historical data visualization with charts
- Weekly mood trend analysis

### Community Reporting System
- Students can report harmful content
- Admin review required before content removal
- Transparent decision-making with audit trail

### Emergency Alert System
- GPS location tracking
- Immediate notification to all administrators
- Secure handling of sensitive location data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

*"The greatest wealth is peace of mind."*
