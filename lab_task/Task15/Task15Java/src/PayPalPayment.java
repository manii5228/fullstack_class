
public class PayPalPayment extends Payment{
	@Override
	public String processPayment(double amount) {
		double totamt=amount+1.50;
		return String.format("Processed Paypal payment:Total Amount=%.2f ", totamt);
	}

}
