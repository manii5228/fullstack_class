package orderDemo;

public class Order {
	int orderId;
	String productName;
	int quantity;
	int availableStock;
	public Order(int orderId, String productName, int quantity, int availableStock) {
		this.orderId = orderId;
		this.productName = productName;
		this.quantity = quantity;
		this.availableStock = availableStock;
	}
	public void processOrder() throws InsufficientStockException{
		if(quantity>availableStock) {
			throw new InsufficientStockException("Order" +orderId+".failed: Insufficient stock");
		}
	}
}
