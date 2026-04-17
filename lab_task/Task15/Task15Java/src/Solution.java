import java.util.*;
public class Solution {
	public static void main(String[] args) {
		Scanner sc =new Scanner(System.in);
		int n =sc.nextInt();
		for(int i=0;i<n;i++) {
			
			char ch = sc.next().charAt(0);
			double amt=sc.nextDouble();
			
			Payment obj=new Payment();
			if (ch=='C') {
				obj= new CreditCardPayment();
				
			}
			else if(ch=='U') {
				obj= new UpiPayment();
			}
			else if (ch=='P') {
				obj= new PayPalPayment();
				
			}
			
			System.out.println(obj.processPayment(amt));
		}
	}

}
