import mongoose from 'mongoose';

const pexels = {
  cake: 'https://images.pexels.com/photos/2067436/pexels-photo-2067436.jpeg?auto=compress&cs=tinysrgb&w=900',
  chocolateCake: 'https://images.pexels.com/photos/3851000/pexels-photo-3851000.jpeg?auto=compress&cs=tinysrgb&w=900',
  croissant: 'https://images.pexels.com/photos/3850330/pexels-photo-3850330.jpeg?auto=compress&cs=tinysrgb&w=900',
  brownie: 'https://images.pexels.com/photos/13215205/pexels-photo-13215205.jpeg?auto=compress&cs=tinysrgb&w=900',
  chocolateSlice: 'https://images.pexels.com/photos/10153294/pexels-photo-10153294.jpeg?auto=compress&cs=tinysrgb&w=900',
};

const catalog = [
  ['Cakes','Cake Jars','Blueberry Baked Cheesecake Jar','Indulgent baked cheesecake with a bright blueberry finish.',239,'cake'],
  ['Cakes','Cake Jars','Lotus Biscoff Cheesecake Jar','Creamy baked cheesecake layered with caramelised Lotus Biscoff.',239,'cake'],
  ['Cakes','Cake Jars','Brownie Cheesecake Jar','Rich cheesecake layered with fudgy brownie pieces.',null,'brownie'],
  ['Cakes','Cake Jars','Hazelnut Baked Cheesecake Jar','Creamy baked cheesecake with a smooth hazelnut finish.',239,'cake'],
  ['Cakes','Cakes','Pineapple Punch Cake','Moist pineapple cake layered with creamy frosting.',null,'cake'],
  ['Cakes','Cakes','Chocolate Mousse Cake','Velvety chocolate mousse layered with moist chocolate cake.',null,'chocolateCake'],
  ['Cakes','Cakes','Chocolate Chips Cake','Soft cake filled with generous chocolate chips.',null,'chocolateCake'],
  ['Cakes','Cakes','German Black Forest Cake','Chocolate cake layered with whipped cream and cherries.',null,'chocolateCake'],
  ['Cakes','Cakes','Caramel Butterscotch Cake','Moist cake with creamy butterscotch filling and drizzle.',null,'cake'],
  ['Cakes','Cakes','Triple Chocolate Cake','Three layers of dark, milk and white chocolate cake.',null,'chocolateCake'],
  ['Cakes','Cakes','Chocolate Truffle Cake','Rich chocolate cake finished with a luxurious truffle layer.',null,'chocolateSlice'],
  ['Cakes','Cakes','Fruit Delight Cake','Light cake layered with cream and fresh seasonal fruits.',null,'cake'],
  ['Cakes','Cakes','Rasmalai Fusion Cake','Modern cake layered with the rich flavour of rasmalai.',null,'cake'],
  ['Cakes','Cakes','Red Velvet Cake','Moist red velvet layers with a smooth creamy frosting.',null,'cake'],
  ['Cakes','Cakes','Coffee Chocolate Cake','A balanced blend of coffee and rich chocolate.',null,'chocolateCake'],
  ['Cakes','Cakes','Hazelnut Chocolate Cake','Chocolate cake with creamy hazelnut filling.',null,'chocolateCake'],
  ['Savouries','Savouries','Baked Chicken Roll','Juicy tender chicken wrapped in a soft roll and baked golden.',79,'cake'],
  ['Pastries','Pastries','Pineapple Delight Pastry','Light pineapple sponge with creamy frosting.',null,'cake'],
  ['Pastries','Pastries','Black Forest Pastry','Chocolate sponge with whipped cream and cherry flavour.',null,'chocolateSlice'],
  ['Pastries','Pastries','Chocolate Chips Pastry','Moist chocolate pastry studded with chocolate chips.',null,'chocolateCake'],
  ['Pastries','Pastries','Chocolate Truffle Pastry','Rich chocolate layers with a smooth truffle filling.',null,'chocolateSlice'],
  ['Pastries','Pastries','Fruit Delight Pastry','Light sponge with cream and fresh fruit topping.',null,'cake'],
  ['Pastries','Pastries','Rasmalai Fusion Pastry','Pastry layers inspired by classic rasmalai flavours.',null,'cake'],
  ['Pastries','Pastries','Rabdi Falooda Pastry','A fusion pastry combining rich rabdi and falooda flavours.',null,'cake'],
  ['Desserts','Donuts','Chocolate Donut','Soft baked donut coated with rich chocolate.',null,'chocolateCake'],
  ['Desserts','Croissants','Butter Croissant','Flaky, golden croissant with a classic buttery finish.',null,'croissant'],
  ['Desserts','Croissants','Nutella Croissant','Flaky croissant filled with smooth chocolate-hazelnut spread.',null,'croissant'],
  ['Desserts','Croissants','Hazelnut Croissant','Golden croissant with a creamy hazelnut filling.',null,'croissant'],
  ['Desserts','Croissants','Lotus Biscoff Croissant','Flaky croissant filled with creamy Lotus Biscoff.',null,'croissant'],
  ['Desserts','Croissants','Blueberry Croissant','Flaky croissant with a sweet blueberry filling.',null,'croissant'],
  ['Brownies','Brownies','Chocolate Hazelnut Brownie','Fudgy chocolate brownie with a rich hazelnut flavour.',null,'brownie'],
  ['Brownies','Brownies','Walnut Brownie','Fudgy chocolate brownie packed with crunchy walnuts.',null,'brownie'],
  ['Brownies','Brownies','Chocolate Fudge Brownie','Deep, intense chocolate flavour in a fudgy brownie.',null,'brownie'],
  ['Brownies','Brownies','Lotus Biscoff Brownie','Fudgy brownie swirled with creamy Lotus Biscoff.',null,'brownie'],
];

export async function seedBakestMenu(Category, Menu) {
  for (const [categoryName, subCategory, name, description, price, imageKey] of catalog) {
    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const category = await Category.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name: categoryName, slug, sort_order: ['Cakes','Savouries','Pastries','Desserts','Brownies'].indexOf(categoryName) } },
      { upsert: true, new: true }
    );
    const itemSlug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    await Menu.findOneAndUpdate(
      { slug: itemSlug },
      { $set: { name, category_id: category._id, description, image: pexels[imageKey], ...(price !== null ? { price } : {}), available: price !== null, veg: name === 'Baked Chicken Roll' ? false : true } },
      { upsert: true, new: true }
    );
  }
  console.log(`The Bakest menu catalog synced: ${catalog.length} items. Unverified prices remain unavailable until exact menu pricing is confirmed.`);
}
