
public class UpiPayment extends Payment{
	@Override
	public String processPayment(double amount) {
		return String.format("Processed UPI payment:Total Amount=%.2f ", amount);
	}

}
