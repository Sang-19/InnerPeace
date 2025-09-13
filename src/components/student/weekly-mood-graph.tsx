
'use client';

import { useState, useEffect } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { subDays, format } from 'date-fns';
import { Mood } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { CardDescription } from '../ui/card';

type MoodDataPoint = {
  date: string;
  mood: number | null;
};

const moodMapping: Record<Mood, number> = {
  'Angry': 1,
  'Sad': 2,
  'Anxious': 3,
  'Neutral': 4,
  'Happy': 5,
};

const moodDisplay: { mood: Mood, emoji: string }[] = [
    { mood: 'Angry', emoji: '😡' },
    { mood: 'Sad', emoji: '😢' },
    { mood: 'Anxious', emoji: '😟' },
    { mood: 'Neutral', emoji: '😐' },
    { mood: 'Happy', emoji: '😊' },
];


const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const moodInfo = moodDisplay[payload.value - 1];
  
    if (!moodInfo) return null;
  
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={12}>
          {`${moodInfo.emoji}`}
        </text>
      </g>
    );
};

export function WeeklyMoodGraph() {
  const { appUser } = useAuth();
  const [data, setData] = useState<MoodDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (appUser) {
      console.log('WeeklyMoodGraph: Setting up mood data listener for user:', appUser.uid);
      const sevenDaysAgo = subDays(new Date(), 7);
      console.log('WeeklyMoodGraph: Querying mood logs from:', sevenDaysAgo);
      
      const q = query(
        collection(db, `users/${appUser.uid}/mood-logs`),
        where('date', '>=', sevenDaysAgo),
        orderBy('date', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('WeeklyMoodGraph: Received snapshot with', snapshot.docs.length, 'mood logs');
        
        const moodLogs = snapshot.docs.map(doc => {
            const data = doc.data() as { mood: Mood, date: Timestamp };
            console.log('WeeklyMoodGraph: Processing mood log:', {
              id: doc.id,
              mood: data.mood,
              date: data.date.toDate().toISOString()
            });
            return {
                mood: moodMapping[data.mood],
                date: data.date.toDate(),
            };
        });

        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const day = subDays(new Date(), 6-i);
            return format(day, 'MMM d');
        });
        
        console.log('WeeklyMoodGraph: Processing data for last 7 days:', last7Days);
        
        let dataFound = false;
        const processedData = last7Days.map(dayStr => {
            const logsForDay = moodLogs.filter(log => format(log.date, 'MMM d') === dayStr);
            if(logsForDay.length > 0) {
                dataFound = true;
                const avgMood = logsForDay.reduce((acc, log) => acc + log.mood, 0) / logsForDay.length;
                console.log('WeeklyMoodGraph: Found mood data for', dayStr, '- average:', avgMood);
                 return { date: dayStr, mood: Math.round(avgMood) };
            }
            return { date: dayStr, mood: null };
        });

        console.log('WeeklyMoodGraph: Final processed data:', processedData);
        console.log('WeeklyMoodGraph: Has data:', dataFound);
        
        setHasData(dataFound);
        setData(processedData);
        setLoading(false);
      }, (error) => {
        console.error('WeeklyMoodGraph: Error fetching mood data:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      console.log('WeeklyMoodGraph: No user available');
      setLoading(false);
    }
  }, [appUser]);

  if (loading) {
    return (
      <div className="h-[350px] w-full flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full relative">
        {!hasData && (
            <div className="absolute inset-0 flex justify-center items-center z-10 pointer-events-none">
                <CardDescription>No mood data recorded in the last 7 days. Start your daily check-in!</CardDescription>
            </div>
        )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[1, 5]}
            tickCount={5}
            tick={<CustomYAxisTick />}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length && payload[0].value !== null) {
                const moodValue = payload[0].value as number;
                const moodInfo = moodDisplay[moodValue - 1];
                return (
                  <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-2 shadow-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-foreground">
                         {moodInfo ? `${moodInfo.emoji} ${moodInfo.mood}` : 'N/A'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: 'hsl(var(--primary))',
              strokeWidth: 0,
            }}
             activeDot={{
                r: 6,
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
            }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
