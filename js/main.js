let eventBus = new Vue();
Vue.component("product", {
    mounted() {
        eventBus.$on("review-submitted", (productReview) => {
            this.reviews.push(productReview);
        });
    },
    props: {
        premium: {
            type: Boolean,
            required: true,
        },
    },
    template: `
<div class="product">
<div class="product-image">
<img :src="image" :alt="altText"/>
</div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <a :href="link">More products like this.</a>
            
            <p v-if="inStock">In stock</p>
            <p v-else>Out of Stock</p>
            
            <p :class="{ productInfoOutOfStock: !inStock }" v-else>Out of Stock</p>
            <span v-if="sale">On Sale</span>
            <span v-else>Not On Sale</span>
            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @mouseover="updateProduct(index)">
            </div>


            <ul v-for="size in sizes">
                <li>{{ size }}</li>
            </ul>
          
          <div class="buttons-container">
          <button
            v-on:click="addToCart"
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
                Add to cart
          </button>
        <button class="del_but" v-on:click="deleteFromCart">Delete from cart</button>
        </div>
        </div>
        <product-tabs :reviews="reviews"></product-tabs>
</div>
`,
    data() {
        return {
            product: "Socks",
            description: "A pair of warm, fuzzy socks",
            brand: "Vue Mastery",
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 100,
            // details: ['80% cotton', '20% polyester',
            //     'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    onSale: true,
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                    onSale: false,
                },
            ],
            sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
            cart: 0,
            reviews: [],
            selectedVariant: 0,
        };
    },
    methods: {
        addToCart() {
            this.$emit("add-to-cart", this.variants[this.selectedVariant].variantId);
        },
        deleteFromCart() {
            this.$emit(
                "delete-from-cart",
                this.variants[this.selectedVariant].variantId,
            );
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
    },
    computed: {
        title() {
            return this.brand + " " + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        sale() {
            return this.variants[this.selectedVariant].onSale;
        },
        // shipping() {
        //     if (this.premium) {
        //         return "Free";
        //     } else {
        //         return 2.99;
        //     }
        // }


    },
});

Vue.component("product-review", {
    template: `
<template>
  <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
    </p>
    <p>
      <label for="name">Name:</label>
      <input id="name" v-model="name" placeholder="name">
    </p>
    <p>
      <label for="review">Review:</label>
      <textarea id="review" v-model="review"></textarea>
    </p>
    <p>
      <label for="rating">Rating:</label>
      <select id="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>
    <p>
      <label for="choice">Would you recommend this product:</label>
      <div class="radit">
        <input type="radio" id="yes" name="choice" v-model="choice" value="yes" :disabled="rating < 4"/>
        <label for="yes">yes</label>
        <input type="radio" id="no" name="choice" v-model="choice" value="no" :disabled="rating < 4"/>
        <label for="no">no</label>
      </div>
    </p>

    <p class="text_submit">
      <input type="submit" value="Submit">
    </p>
  </form>
`,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            choice: null,
            favourites: false,
            errors: [],
        };
    },
    watch: {
        rating(newRating) {
            if (newRating <= 3) {
                this.choice = "no";
            } else {
                this.choice = "yes";
            }
        },

    },

    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.choice) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    choice: this.choice,
                    favourites: this.favourites,
                };
                eventBus.$emit("review-submitted", productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.choice = null;
                this.favourites = false;
            } else {
                if (!this.name) this.errors.push("Name required.");
                if (!this.review) this.errors.push("Review required.");
                if (!this.rating) this.errors.push("Rating required.");
                if (!this.choice) this.errors.push("Choice required.");
            }


        },
    },
});

Vue.component("product-tabs", {
    props: {
        reviews: {
            type: Array,
            required: false,
        },
    },
    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div class="li_rev" v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p><br>
         <ul>
           <li v-for="(review, index) in reviews">
              <p>Name: {{ review.name }}</p>
              <p>Rating: {{ review.rating }}</p>
              <p>Review:{{ review.review }}</p>
              <p>Choice: {{ review.choice }}</p>
              <p class="star-checkbox">
                <label class="star_label" for="favourites">Favourite:</label>
                <input class="star_input" type="checkbox" id="favourites" v-model="reviews[index].favourites">
                <span class="star-overlay">★</span>
              </p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       <div v-show="selectedTab === 'Details'">
         <product_details></product_details>
       </div>
       <div v-show="selectedTab === 'Shipping'">
         <product_shipping></product_shipping>
       </div>
       <div v-show="selectedTab === 'Favorites'">
         <h2>Favorites</h2>
         <ul>
           <li v-for="review in favoriteReviews" :key="review.id">
              <p>Name: {{ review.name }}</p>
              <p>Rating: {{ review.rating }}</p>
              <p>Review: {{ review.review }}</p>
              <p>Choice: {{ review.choice }}</p>
           </li>
         </ul>
       </div>
     </div>
    `,
    data() {
        return {
            tabs: ["Reviews", "Make a Review", "Details", "Shipping", "Favorites"],
            selectedTab: "Reviews",
        };
    },
    computed: {
        favoriteReviews() {
            return this.reviews.filter(review => review.favourites);
        }
    }
});
Vue.component("product_details", {
    template: `
            <div class="li_rev">
                <ul>
                    <li v-for="detail in details">{{ detail }}</li>
                </ul>
            </div>
    `,
    data() {
        return {
            details: ["80% cotton", "20% polyester", "Gender-neutral"],
        };
    },
});



Vue.component("product_shipping", {
    template: `
     <p class="li_rev">Shipping: {{ shipping }}</p>
    `,
    computed: {
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99;
            }
        },
    },
});


let app = new Vue({
    el: "#app",
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        deleteCart() {
            this.cart.pop();
        },
    },
});