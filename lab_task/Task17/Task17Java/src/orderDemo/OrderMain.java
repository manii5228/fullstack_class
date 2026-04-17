package orderDemo;
import java.util.*;
public class OrderMain {
	public static void main(String[] args) {
		Scanner sc=new Scanner(System.in);
		int n=sc.nextInt();
		for(int i=0;i<n;i++) {
			int oid=sc.nextInt();
			String pname=sc.next();
			int quantity=sc.nextInt();
			int availableStock=sc.nextInt();
			Order obj=new Order(oid, pname, quantity, availableStock);
			try {
				obj.processOrder();
				System.out.print("Order" +oid +"processed successfully");
			}
			catch(Exception e) {
				System.out.print(e.getMessage());
			}
		}
	}
}
