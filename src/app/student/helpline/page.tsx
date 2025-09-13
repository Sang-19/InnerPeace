import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import helplinesData from '@/lib/helplines.json';
import type { Helpline } from '@/lib/types';
import { Phone, Mail, MessageSquare, Video, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HelplinePage() {
  const helplines: Helpline[] = helplinesData.helplines;

  const getIcon = (type: Helpline['type']) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'chat':
        return <MessageSquare className="h-5 w-5" />;
    }
  };
  
  const getAction = (type: Helpline['type'], contact: string, url?: string) => {
    switch (type) {
        case 'phone':
            return <Button asChild><Link href={`tel:${contact}`}>Call Now</Link></Button>;
        case 'email':
            return <Button asChild><Link href={`mailto:${contact}`}>Send Email</Link></Button>;
        case 'chat':
            return <Button asChild><Link href={url || '#'} target="_blank" rel="noopener noreferrer">Start Chat</Link></Button>;
    }
  }


  return (
    <div className="space-y-6">
      <Card className="text-center bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Immediate Support Available</CardTitle>
          <CardDescription>
            You are not alone. Reach out to these professional helplines for confidential support, or use the options below for direct help.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Immediate Video Consultation</CardTitle>
            <Video className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Connect with a professional for an emergency video call.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="destructive">
              <Link href="https://meet.google.com" target="_blank" rel="noopener noreferrer">Start Emergency Call</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Book an Appointment</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Find and schedule a session with a therapist near you.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
                <Link href="https://www.google.com/search?q=therapist+near+me" target="_blank" rel="noopener noreferrer">Find a Therapist</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {helplines.map((helpline) => (
          <Card key={helpline.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{helpline.name}</CardTitle>
              {getIcon(helpline.type)}
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{helpline.contact}</p>
            </CardContent>
            <CardFooter>
                {getAction(helpline.type, helpline.contact, helpline.url)}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
