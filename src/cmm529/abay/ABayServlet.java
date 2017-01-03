package cmm529.abay;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.*;
import javax.servlet.http.*;

//import com.google.appengine.repackaged.com.google.gson.JsonParser;
/*import com.google.appengine.api.datastore.*;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;*/
import com.google.gson.*;

import cmm529.abay.data.Bid;
import cmm529.abay.data.Item;
import cmm529.abay.util.Utility;



@SuppressWarnings("serial")
public class ABayServlet extends HttpServlet {	
	
	private List<Long> order = new ArrayList<Long>();
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException
	{
		resp.setContentType("text/plain");		
		
		try{			
			String idItem=req.getParameter("idItem");
			System.out.println("idItem="+idItem);
			
			if(idItem!=null){//PlaceBid
				String bidder=req.getParameter("bidder");	
				long idItemLong=Long.parseLong(idItem);	
				double amount=Double.parseDouble(req.getParameter("amount"));	
				String sms = "";
				
				//add Bid for this idItemLong
				Bid bid = new Bid(bidder,idItemLong,amount);
				bid.setDate(new Date().getTime());
								
				//Determining the Current Price of the Item
				//Update item's price if bids>1 
				
				EntityManagerFactory factory1 = Persistence.createEntityManagerFactory("transactions-optional");
		    	EntityManager manager1 = factory1.createEntityManager();
		    	manager1.getTransaction().begin();	//begin transaction
		    	
		    	Query queryItem = manager1.createQuery("select i from Item i where i.id="+idItemLong);
		    	
		    	Item item = (Item) queryItem.getSingleResult();
		    	
		    	Query queryBid = manager1.createQuery("select b from Bid b where b.itemId="+idItemLong+" order by b.date asc");
		    	
		    	List<Bid> bids =  queryBid.getResultList();
		    	
		    	if(bids.size()>0){
			    	Bid bidWinner = new Utility().findWinningBid(bids);
			    	System.out.println("item new Offer="+amount+" Winner offer=" + bidWinner.getOffer() + " bids.size()="+bids.size());
			    	if(amount>bidWinner.getOffer()){
					
						double newPrice = new Utility().calcItemPrice(amount, bidWinner.getOffer(), 0.5);
			    		System.out.println("item new Offer="+amount+" Winner offer=" + bidWinner.getOffer() + " currentPrice="+newPrice);
			    		
			    		item.setCurrentPrice(newPrice);
			    		manager1.persist(item);
			    		
						sms+=" The price in the item was updated.";			    		
			    	}else{
			    		sms+=" The price in the item do not need to be modified.";			    					    		
			    	}
			    				    				    	
			    	manager1.persist(bid);
					
					//return code 201 Created
					sms += "Bid saved.";
					System.out.println("Bid saved.");
					
			    	System.out.println("sms="+sms);
			    	resp.setStatus(201);
			    	resp.getWriter().print(sms);	
		    	}
		    	manager1.getTransaction().commit();	//end transaction
		    	manager1.close();
		    	factory1.close();
					
			}else{//Add New Item
				//parameters are filled because the JavaScript code checked it
				String seller=req.getParameter("seller");
				String title=req.getParameter("title");
				double stprice=Double.parseDouble(req.getParameter("stprice"));				
				String description=req.getParameter("description");
				
				long deadline=Long.parseLong(req.getParameter("dateTime"));													
					
				Item item = new Item(seller,title,description,stprice,deadline);
				//long otherDate = new Date().getTime();
				//Item item = new Item("Violeta","laptop acer","Aspire E1-571",222.15,new Date().getTime());
				
				saveItemInfo(item);	//save item object into datastore
				
				resp.setStatus(201);					//return code 201 Created
				// Note that we don't really need to generate any reply
				// as the status code 201 already mean something to the client.
				resp.getWriter().print("Item saved.");
			}
							
		} catch (NullPointerException e)
		{
		//resp.getWriter().println("Missing parameter in doPost");	
		resp.sendError(400,e.toString());	//return code 400
		}
	catch (Exception e)
		{
		//resp.getWriter().println(e.toString());
		resp.sendError(400,e.toString());	//return code 400
		}	
		}//post
	
	
	//when the system starts, it shows a list items on auction in ascending order of ther deadline
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {				
		try{
			
			if (req.getPathInfo()==null){//retrieve all of them

				Map<Long,Item> mapItems=getAllItems(); 
				Set<Long> keys = mapItems.keySet();
				Iterator<Long> it = keys.iterator();
				Collection<Item> items=mapItems.values();
				String itemsJson="[";
				
				//Map lose the order so we save it in a list				
				for (int i=0;i<order.size();i++){
					long id = order.get(i);
					Item item = mapItems.get(id);
					itemsJson += "{\"id\":"+id+",\"title\":\""+item.getTitle()+"\",\"description\":\""+item.getDescription()+"\",\"seller\":\""+item.getSeller()+"\",\"currentPrice\":\""+item.getCurrentPrice()+"\",\"deadline\":\""+item.getDeadline()+"\"},";
					//System.out.println("title="+item.getTitle()+" deadline="+item.getDeadline());
				}
				/*while(it.hasNext()){
					 long id = it.next();
					 Item item = mapItems.get(id);
					 itemsJson += "{\"id\":"+id+",\"title\":\""+item.getTitle()+"\",\"description\":\""+item.getDescription()+"\",\"seller\":\""+item.getSeller()+"\",\"currentPrice\":\""+item.getCurrentPrice()+"\",\"deadline\":\""+item.getDeadline()+"\"},";
				}*/	
				
				//delete last , in last element
				itemsJson = itemsJson.substring(0,itemsJson.length()-1);
				itemsJson = itemsJson + "]";							   
			    			    			
				resp.setContentType("application/json");
				resp.getWriter().print(new Gson().toJson(itemsJson));								
												
				resp.setStatus(200);					//return code 200 request successful
			}else{//if pathinfo is not null is because we receive the id of the item to show details
				Long id=new Long(req.getPathInfo().substring(1));
				System.out.println("id="+id);
				String attribute=req.getParameter("attribute");
				System.out.println("attribute="+attribute);
				
				if(attribute!=null && attribute.equalsIgnoreCase("bids")){//Retrieve all bids on an item(given an item ID)
					
					EntityManagerFactory factoryBids = Persistence.createEntityManagerFactory("transactions-optional");
			    	EntityManager managerBids = factoryBids.createEntityManager();
			    	
			    	//Retrieve the bids
			    	//select this Item's Bid select b from Bid b where b.itemId="+id
			    			    	
			    	Query queryBid = managerBids.createQuery("select b from Bid b where b.itemId="+id+" order by b.date asc");
			    	
			    	List<Bid> bids =  queryBid.getResultList();
			    	String itemBidsJson="[";
			    	
			    	/*
			    	 * [{"bidder":”some_bidder”,"amount":"99.99","date":”1435363620000”},
						{"bidder":”some_bidder1”,"amount":"49.99","date":”1435363620001”}]
			    	 * */
			    	
			    	for(Bid b:bids){
		    			System.out.println("Retrieving bids of item ="+id+" bids size ="+bids.size()+"Bidder="+b.getBidder()+"Offer="+b.getOffer());
		    			itemBidsJson += "{\"bidder\":"+b.getBidder()+",\"amount\":\""+b.getOffer()+"\",\"date\":\""+b.getDate()+"\"},";
		    		}
			    	//delete last , in last element
			    	itemBidsJson = itemBidsJson.substring(0,itemBidsJson.length()-1);
			    	itemBidsJson = itemBidsJson + "]";	
			    	
			    	if(bids.size()>0){
			    		resp.setContentType("application/json");				//set content-type to JSON					    			    					    	
			    		resp.getWriter().print(new Gson().toJson(itemBidsJson));								
													
			    		
			    	}else{
			    		resp.setContentType("text/plain");				//set content-type to JSON					    					    	
			    		resp.getWriter().print(new Gson().toJson("The item with id "+id+" have not bids"));								
																    		
			    	}
			    	factoryBids.close();
			    	managerBids.close();
			    	resp.setStatus(200);					//return code 200 request successful
					
				}else{
		    	
			    	EntityManagerFactory factory = Persistence.createEntityManagerFactory("transactions-optional");
			    	EntityManager manager = factory.createEntityManager();
			    	Query queryItem = manager.createQuery("select i from Item i where i.id="+id);
			    	
			    	Item item = (Item) queryItem.getSingleResult();
			    	
			    	//Retrieve the bids
			    	//select this Item's Bid select b from Bid b where b.itemId="+id
			    			    	
			    	Query queryBid = manager.createQuery("select b from Bid b where b.itemId="+id+" order by b.date asc");
			    	
			    	List<Bid> bids =  queryBid.getResultList();
			    	
			    	resp.setContentType("application/json");				//set content-type to JSON				
		    		
		    		
			    	String itemBidJson="";
			    	itemBidJson += "{\"id\":"+id+",\"title\":\""+item.getTitle()+"\",\"description\":\""+item.getDescription()+"\",\"seller\":\""+item.getSeller()+"\",\"currentPrice\":\""+item.getCurrentPrice()+"\",\"deadline\":\""+item.getDeadline()+"";
			    	
			    	//if any Bid for this Item currentPrice=startPrice
			    	if(bids.isEmpty()){
			    		//No of Bid: 0 (winner: ---)
			    		System.out.println("up no bids for id"+id);  		    		
			    		itemBidJson +="\",\"numBid\":\"0\",\"winner\":\"---";
			    		
			    	}else if(bids.size()==1){
			    		//No of Bid: 1 (winner: b.getBidder())// currentPrice = startPrice that is the item's price
			    		
			    		for(Bid b:bids){
			    			System.out.println("down only one size="+bids.size()+"Bidder="+b.getBidder()+"Offer="+b.getOffer());
			    			itemBidJson +="\",\"numBid\":\"1\",\"winner\":\""+b.getBidder()+"";
			    		}
			    		
			    	}else{
			    		Bid bidWinner = new Utility().findWinningBid(bids);
			    		//No of Bid: bids.size() (winner: bidWinner.getBidder()) // currentPrice that is the item's price
			    		System.out.println("more than 1 size="+bids.size()+"Bidder="+bidWinner.getBidder()+"Offer="+bidWinner.getOffer()); 		    				    		
			    		itemBidJson +="\",\"numBid\":\""+bids.size()+"\",\"winner\":\""+bidWinner.getBidder()+"";
			    				    				    				    		
			    	}
			    	
			    	itemBidJson +="\"}";
			    	resp.getWriter().print(new Gson().toJson(itemBidJson));								
					factory.close();
					manager.close();
					resp.setStatus(200);			
				}//if attribute bids
			}//if pathinfo is not null is because we receive the id of the item to show details
		}//try
		catch (Exception e)	//other exception, maybe no ID specified
		{
			resp.sendError(400,e.toString());	//return code 400 some error
		}				
		
				
	}
	
	////////////////////////////////////////////
	//Get All Items
	/**
	 * Retrieve all cities from the GAE datastore and return them as a Iterable<City> object.
	 * @return
	 */
	//public Iterable<ItemWithID> getAllItems()
	public Map<Long,Item> getAllItems()
	{
	//List<ItemWithID> items=new ArrayList<ItemWithID>();
	 Map<Long,Item>  mapItems = new HashMap();
	 order = new ArrayList<Long>();

		try	{
			/*DatastoreService service=DatastoreServiceFactory.getDatastoreService();
			
			
			Query query=new Query("Item").addSort("deadline", SortDirection.ASCENDING);//Item is a kind
			PreparedQuery result=service.prepare(query);
			
			for (Entity itemEntity: result.asIterable())
				{				
								
				//String id=itemEntity.getAppId();
				//System.out.println("id="+id);
				String title=(String)itemEntity.getProperty("title");				
				String seller=(String)itemEntity.getProperty("seller");				
				String desc=(String)itemEntity.getProperty("description");																
				double price=(double) itemEntity.getProperty("currentPrice");				
				long deadline=(long) itemEntity.getProperty("deadline");		

				Item item = new Item("",title,desc,price,deadline);//the id of each item is store in seller attribute

				System.out.println("id="+itemEntity.getProperty("Name"));
				
				items.add(item);
				
				
				}*/
			
			EntityManagerFactory factory = Persistence.createEntityManagerFactory("transactions-optional");
			EntityManager manager = factory.createEntityManager();
			Query query = manager.createQuery("select i from Item i order by i.deadline asc");
			List<Item> result = query.getResultList();
			
			for(Item i:result){							
				//System.out.println("title="+i.getTitle()+" deadline="+i.getDeadline());
				Item item = new Item(i.getSeller(),i.getTitle(),i.getDescription(),i.getCurrentPrice(),i.getDeadline());//the id of each item is store in seller attribute
				
				mapItems.put(i.getId(), item);//Map lose the order so we implement a arrayList to save it
				order.add(i.getId());
				//items.add(item);
			}
			return mapItems;
			
			
			} catch (Exception e)
				{
				return null;	
				}
	} //end method
	
	
	//////////////////////////////////////////
	// save a Item object to the GAE DS
	//
	public void saveItemInfo(Item item)
	{	
		
		EntityManagerFactory factory = Persistence.createEntityManagerFactory("transactions-optional");	
		EntityManager manager=factory.createEntityManager();	
		manager.getTransaction().begin();	//begin transaction
		manager.persist(item);
		manager.getTransaction().commit();	//end transaction
		manager.close();
		factory.close();
		
	} //end method
	
	//////////////////////////////////////////
	// save a Bid object to the GAE DS
	//
	public void saveBidInfo(Bid bid)
	{	
	
	EntityManagerFactory factory = Persistence.createEntityManagerFactory("transactions-optional");	
	EntityManager manager=factory.createEntityManager();	
	manager.getTransaction().begin();	//begin transaction
	manager.persist(bid);
	manager.getTransaction().commit();	//end transaction
	manager.close();
	factory.close();
	} //end method
}
