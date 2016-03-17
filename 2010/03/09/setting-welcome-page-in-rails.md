[![](http://www.mograbi.co.il/guy_mograbi/rails_api/rails.png)](http://www.mograbi.co.il/guy_mograbi/rails_api/rails.png)  
[Check how I advance in Rails](http://rails.mograbi.co.il/)  

# Setting a welcome-page

In Java/Tomcat I have a web.xml to define a "welcome-page" which usually points to some index.jsp. This means that if my root URL is http://www.mograbi.co.il/guy_mograbi  
it will show the page http://www.mograbi.co.il/guy_mograbi/index.jsp .  

In Rails it works like this :  

*   Under your application root folder you will find the folder "public". In which you will see an "index.html" file - that default to "Rails Welcome" that looks like the IFrame I show below
*   In folder "config" you will see the file "routes.rb" that is very important - I will dedicate a whole entry only on this file. You can define the welcome page like as such :  

    <pre>map.root :controller => "categories"</pre>

    (for example). Read more about it [here](http://api.rubyonrails.org/classes/ActionController/Routing.html)  

This is how the default welcome page from rails looks like :  
<iframe src="http://www.mograbi.co.il/guy_mograbi/rails_api/default_index.html" style="height: 400px; width: 600px;"></iframe>