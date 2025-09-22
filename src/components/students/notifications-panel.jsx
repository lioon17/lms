import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, XCircle, MessageSquare, Clock } from "lucide-react"

export function NotificationsPanel() {
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Certificate Issued",
      message: "Your Data Science Fundamentals certificate is ready for download.",
      timestamp: "2 hours ago",
      isRead: false,
    },
    {
      id: 2,
      type: "failure",
      title: "Quiz Attempt Failed",
      message: "Module 3 Final Assessment - You can retry in 24 hours.",
      timestamp: "1 day ago",
      isRead: false,
    },
    {
      id: 3,
      type: "announcement",
      title: "Instructor Announcement",
      message: "New bonus materials added to Advanced React Development course.",
      timestamp: "2 days ago",
      isRead: true,
    },
    {
      id: 4,
      type: "reminder",
      title: "Quiz Due Soon",
      message: "Component Lifecycle Quiz is due in 3 days.",
      timestamp: "3 days ago",
      isRead: true,
    },
  ]

 const getNotificationIcon = (type) => {
   switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-chart-1" />
      case "failure":
        return <XCircle className="w-4 h-4 text-chart-5" />
      case "announcement":
        return <MessageSquare className="w-4 h-4 text-chart-2" />
      case "reminder":
        return <Clock className="w-4 h-4 text-chart-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-balance">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border rounded-lg transition-colors ${
                notification.isRead ? "bg-background" : "bg-muted/30"
              }`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-balance">{notification.title}</h4>
                    {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <p className="text-xs text-muted-foreground text-pretty">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
