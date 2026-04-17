
public class CreditCardPayment extends Payment{
	@Override
	public String processPayment(double amount) {
		double totamt=amount+(amount*0.02);
		return String.format("Processed CreditCard payment:Total Amount=%.2f ", totamt);
	}
    
}
