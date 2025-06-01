import { standardizeComponent } from "../src/standardize";

const code = `
import React, { useState, useEffect } from "react";

interface Activity {
  id: number;
  description: string;
  time: string;
}

const RecentActivity: React.FC = ({title, ...props}: ActivityProps) => {
  const [activities, setActivities] = useState<Activity[]>([title]);

  useEffect(() => {
    const dummyData: Activity[] = [
      { id: 1, description: 'User John updated his profile.', time: '10 minutes ago' },
      { id: 2, description: 'User Jane posted a new message.', time: '20 minutes ago' },
      { id: 3, description: 'User Bob uploaded a new photo.', time: '30 minutes ago' },
    ];
    setActivities(dummyData);
  }, []);

  const handleActivityClick = (activityId: number) => {
    console.log(\`Activity \${activityId} clicked\`);
  };


  return (
    <div className="recent-activity">
      {title && <h1 className="recent-activity__title">{title}</h1>}
      {props.kool}
      <h2 className="recent-activity__title">Recent Activity</h2>
      {activities.length > 0 ? (
        <ul className="recent-activity__list">
          {activities.map((activity) => (
            <li key={activity.id} className="recent-activity__item" onClick={() => handleActivityClick(activity.id)}>
              <p className="recent-activity__description">{activity.description}</p>
              <span className="recent-activity__time">{activity.time}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="recent-activity__empty">No recent activity.</p>
      )}
    </div>
  );
};

export default RecentActivity;`;

const std = standardizeComponent(code);
console.log(std);
