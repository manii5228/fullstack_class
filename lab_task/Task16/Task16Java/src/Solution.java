import java.util.*;
public class Solution {
	public static void main(String[] args) {
		Scanner sc=new Scanner(System.in);
	    int n=sc.nextInt();
	    sc.nextLine();
	    for(int i=0;i<n;i++) {
	    	String input=sc.nextLine();
	    	char t=input.charAt(0);
	    	String message=input.substring(2);
	    	Notification obj=NotificationFactory.gotNotification(t);
	    	if(obj!=null) {
	    		obj.sendNotification(message);
	    	}
	    }
	}
}
