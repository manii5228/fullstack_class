
public class EmailNotification implements Notification{

	@Override
	public void sendNotification(String message) {
		// TODO Auto-generated method stub
		System.out.print("Sent Email notification:"+message);
	}

}
