import mongoose from 'mongoose';

const P = 'https://images.pexels.com/photos/';
const img = (id) => `${P}${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
const images = {
  cakes:[2067436,3851000,10153294,1055272,1703272,291528,3026808,3026808,1055272,2067436],
  cheesecakes:[38495630,2067436,1055272,3026808,1703272,38495630,2067436,1055272,3026808,38495630],
  jars:[4110008,2067436,38495630,4110008,2067436,1055272,4110008,38495630,2067436,4110008],
  croissants:[3850330,13736076,1126359,3850330,13736076,1126359,3850330,13736076,1126359,3850330],
  brownies:[13215205,9501658,3026808,13215205,9501658,3026808,13215205,9501658,3026808,13215205],
  cookies:[2309256,291528,2309256,291528,2309256,291528,2309256,291528,2309256,291528],
  pastries:[10153294,1055272,1703272,10153294,1055272,1703272,10153294,1055272,1703272,10153294],
  savouries:[3851000,1055272,1703272,3851000,1055272,1703272,3851000,1055272,1703272,3851000],
  donuts:[1556688,1556688,1556688,1556688,1556688,1556688,1556688,1556688,1556688,1556688],
  desserts:[1055691,1055691,3026808,1055691,3026808,1055691,3026808,1055691,3026808,1055691],
  cupcakes:[1775043,1775043,1775043,1775043,1775043,1775043,1775043,1775043,1775043,1775043],
  muffins:[1058277,1058277,1058277,1058277,1058277,1058277,1058277,1058277,1058277,1058277],
  breads:[1028714,1028714,1028714,1028714,1028714,1028714,1028714,1028714,1028714,1028714],
  tarts:[3026808,3026808,2067436,3026808,2067436,3026808,2067436,3026808,2067436,3026808],
  pies:[1055272,1055272,2067436,1055272,2067436,1055272,2067436,1055272,2067436,1055272],
  beverages:[1055272,1055272,1055272,1055272,1055272,1055272,1055272,1055272,1055272,1055272]
};

const categories = [
  ['Cakes','cakes',['Classic Vanilla Celebration Cake','Chocolate Truffle Cake','Red Velvet Cake','Black Forest Cake','Pineapple Cream Cake','Butterscotch Crunch Cake','Hazelnut Chocolate Cake','Coffee Mocha Cake','Fruit Fresh Cream Cake','Rasmalai Fusion Cake']],
  ['Cheesecakes','cheesecakes',['New York Cheesecake','Blueberry Cheesecake','Lotus Biscoff Cheesecake','Strawberry Cheesecake','Mango Cheesecake','Chocolate Cheesecake','Oreo Cheesecake','Caramel Cheesecake','Hazelnut Cheesecake','Classic Baked Cheesecake']],
  ['Cake Jars','jars',['Blueberry Cheesecake Jar','Lotus Biscoff Cheesecake Jar','Brownie Cheesecake Jar','Hazelnut Cheesecake Jar','Chocolate Truffle Jar','Red Velvet Jar','Mango Cheesecake Jar','Oreo Cream Jar','Strawberry Shortcake Jar','Caramel Crunch Jar']],
  ['Croissants','croissants',['Butter Croissant','Chocolate Croissant','Nutella Croissant','Almond Croissant','Hazelnut Croissant','Lotus Biscoff Croissant','Blueberry Croissant','Cheese Croissant','Cinnamon Croissant','Pistachio Croissant']],
  ['Brownies','brownies',['Classic Fudge Brownie','Walnut Brownie','Chocolate Hazelnut Brownie','Lotus Biscoff Brownie','Oreo Brownie','Double Chocolate Brownie','Salted Caramel Brownie','Espresso Brownie','Peanut Butter Brownie','Triple Chocolate Brownie']],
  ['Cookies','cookies',['Classic Choco Chip Cookie','Double Chocolate Cookie','Oatmeal Raisin Cookie','Butter Cookie','Red Velvet Cookie','Lotus Biscoff Cookie','White Chocolate Macadamia Cookie','Peanut Butter Cookie','Nutella Stuffed Cookie','Dark Chocolate Sea Salt Cookie']],
  ['Pastries','pastries',['Pineapple Delight Pastry','Black Forest Pastry','Chocolate Chips Pastry','Chocolate Truffle Pastry','Fruit Delight Pastry','Rasmalai Fusion Pastry','Rabdi Falooda Pastry','Red Velvet Pastry','Butterscotch Pastry','Coffee Mocha Pastry']],
  ['Savouries','savouries',['Baked Chicken Roll','Chicken Puff','Veg Puff','Paneer Puff','Cheese Garlic Roll','Veg Pizza Pocket','Chicken Pizza Pocket','Spinach Cheese Puff','Corn Cheese Roll','Masala Veg Roll']],
  ['Donuts','donuts',['Classic Glazed Donut','Chocolate Glazed Donut','Sprinkle Donut','Nutella Donut','Lotus Biscoff Donut','Vanilla Cream Donut','Strawberry Donut','Double Chocolate Donut','Cinnamon Sugar Donut','Caramel Donut']],
  ['Desserts','desserts',['Chocolate Mousse','Classic Tiramisu','Caramel Pudding','Chocolate Pudding','Fruit Cream Cup','Mango Mousse','Strawberry Mousse','Oreo Dessert Cup','Brownie Sundae Cup','Vanilla Panna Cotta']],
  ['Cupcakes','cupcakes',['Vanilla Cupcake','Chocolate Cupcake','Red Velvet Cupcake','Black Forest Cupcake','Strawberry Cupcake','Lotus Biscoff Cupcake','Oreo Cupcake','Caramel Cupcake','Coffee Cupcake','Hazelnut Cupcake']],
  ['Muffins','muffins',['Blueberry Muffin','Chocolate Chip Muffin','Double Chocolate Muffin','Banana Walnut Muffin','Vanilla Muffin','Strawberry Muffin','Coffee Crumble Muffin','Apple Cinnamon Muffin','Lemon Muffin','Carrot Walnut Muffin']],
  ['Breads','breads',['Classic Milk Bread','Garlic Bread Loaf','Cheese Bread','Multigrain Bread','Whole Wheat Bread','Cinnamon Raisin Bread','Brioche Loaf','Herb Bread','Olive Focaccia','Stuffed Cheese Bread']],
  ['Tarts','tarts',['Fresh Fruit Tart','Chocolate Ganache Tart','Lemon Tart','Strawberry Tart','Blueberry Tart','Mango Tart','Caramel Nut Tart','Apple Cinnamon Tart','Chocolate Hazelnut Tart','Mixed Berry Tart']],
  ['Pies','pies',['Apple Pie','Chocolate Cream Pie','Blueberry Pie','Strawberry Pie','Banana Cream Pie','Mango Pie','Caramel Pecan Pie','Mixed Berry Pie','Coconut Cream Pie','Classic Fruit Pie']],
  ['Beverages','beverages',['Classic Cold Coffee','Chocolate Frappe','Vanilla Frappe','Hazelnut Frappe','Strawberry Milkshake','Mango Milkshake','Oreo Shake','Hot Chocolate','Cappuccino','Iced Mocha']]
];

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const descriptionFor = (name) => `Freshly prepared ${name.toLowerCase()} with premium ingredients, balanced sweetness and a freshly baked The Bakest finish.`;
const priceFor = (name, category) => { if(category==='Beverages') return 129; if(category==='Savouries') return 99; if(category==='Cakes'||category==='Cheesecakes'||category==='Cake Jars') return 239; if(category==='Pies'||category==='Tarts') return 179; if(category==='Brownies'||category==='Cookies') return 89; return 119; };

export async function seedBakestMenu(Category, Menu) {
  let sort = 0;
  for (const [categoryName, key, names] of categories) {
    const category = await Category.findOneAndUpdate(
      { slug:key },
      { $set:{name:categoryName,slug:key,sort_order:sort++} },
      { upsert:true,new:true }
    );
    for (let i=0;i<names.length;i++) {
      const name=names[i];
      const itemSlug=slugify(name);
      await Menu.findOneAndUpdate(
        {slug:itemSlug},
        {$set:{name,slug:itemSlug,category_id:category._id,description:descriptionFor(name),image:img(images[key][i]),price:priceFor(name,categoryName),available:true,featured:i<2,bestseller:i<3,veg:!['Chicken','Chicken Puff','Chicken Pizza Pocket','Baked Chicken Roll'].some(x=>name.includes(x)),sort_order:i}},
        {upsert:true,new:true}
      );
    }
  }
  console.log(`The Bakest catalog synced: ${categories.length} categories × 10 items = ${categories.length*10} items.`);
}
