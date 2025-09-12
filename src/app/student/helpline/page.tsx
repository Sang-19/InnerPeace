import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import helplinesData from '@/lib/helplines.json';
import type { Helpline } from '@/lib/types';
import { Phone, Mail, MessageSquare } from 'lucide-react';
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
  
  const getAction = (type: Helpline['type'], contact: string) => {
    switch (type) {
        case 'phone':
            return <Button asChild><Link href={`tel:${contact}`}>Call Now</Link></Button>;
        case 'email':
            return <Button asChild><Link href={`mailto:${contact}`}>Send Email</Link></Button>;
        case 'chat':
            // Assuming chat links are web-based for now
            return <Button asChild><Link href="#" >Start Chat</Link></Button>;
    }
  }


  return (
    <div className="space-y-6">
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Immediate Support Available</CardTitle>
          <CardDescription>
            You are not alone. Reach out to these professional helplines for confidential support.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {helplines.map((helpline) => (
          <Card key={helpline.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{helpline.name}</CardTitle>
              {getIcon(helpline.type)}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{helpline.contact}</p>
            </CardContent>
            <div className="p-6 pt-0">
                {getAction(helpline.type, helpline.contact)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
