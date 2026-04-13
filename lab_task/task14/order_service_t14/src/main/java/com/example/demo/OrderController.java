package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")

public class OrderController {
	@Autowired
	private UserClient userclient;
	
	public String getOrder(@PathVariable String OrderId,String UserId) {
		String userInfo=userclient.getUserInfo(UserId);
		return "Order#" +OrderId +"placed By" +userInfo;

}
}