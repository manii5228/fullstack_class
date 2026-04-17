
public class NotificationFactory {
	public static Notification gotNotification(char t){
		switch(t) {
		case 'E':
			return new EmailNotification();
		case 'P':
			return new PushNotification();
		case 'S':
			return new SMSNotification();
		default:
			return null;
		}	
	}
}
