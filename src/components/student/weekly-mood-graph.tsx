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
  mood: number;
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
        <text x={0} y={0} dy={4} textAnchor="end" fill="#666">
          {`${moodInfo.emoji} ${moodInfo.mood}`}
        </text>
      </g>
    );
};

export function WeeklyMoodGraph() {
  const { appUser } = useAuth();
  const [data, setData] = useState<MoodDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appUser) {
      const sevenDaysAgo = subDays(new Date(), 7);
      const q = query(
        collection(db, `users/${appUser.uid}/mood-logs`),
        where('date', '>=', sevenDaysAgo),
        orderBy('date', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const moodLogs = snapshot.docs.map(doc => {
            const data = doc.data() as { mood: Mood, date: Timestamp };
            return {
                mood: moodMapping[data.mood],
                date: data.date.toDate(),
            };
        });

        // Create a map of the last 7 days
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const day = subDays(new Date(), 6-i);
            return format(day, 'MMM d');
        });
        
        const processedData = last7Days.map(dayStr => {
            const logsForDay = moodLogs.filter(log => format(log.date, 'MMM d') === dayStr);
            if(logsForDay.length > 0) {
                // Average mood for the day if multiple entries exist
                const avgMood = logsForDay.reduce((acc, log) => acc + log.mood, 0) / logsForDay.length;
                 return { date: dayStr, mood: Math.round(avgMood) };
            }
            return { date: dayStr, mood: 0 }; // Show 0 for days with no data
        }).filter(d => d.mood > 0); // Only show days with entries

        setData(processedData);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [appUser]);

  if (loading) {
    return (
      <div className="h-[350px] w-full flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
        <div className="h-[350px] w-full flex justify-center items-center">
            <CardDescription>No mood data recorded in the last 7 days. Start your daily check-in!</CardDescription>
        </div>
    );
  }


  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[1, 5]}
            tickCount={5}
            tick={<CustomYAxisTick />}
            width={80}
          />
          <Tooltip
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const moodValue = payload[0].value as number;
                const moodInfo = moodDisplay[moodValue - 1];
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {label}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Mood
                        </span>
                        <span className="font-bold">
                           {moodInfo ? `${moodInfo.emoji} ${moodInfo.mood}` : 'N/A'}
                        </span>
                      </div>
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
