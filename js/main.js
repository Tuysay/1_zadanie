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
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
            <p v-if="inStock">In stock</p>
            <p v-else>Out of Stock</p>
            <p>Shipping: {{ shipping }}</p>
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
            <button
                    v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
            >
                Add to cart
            </button>
            <button v-on:click="deleteFromCart">Delete from cart</button>
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
            details: ['80% cotton', '20% polyester',
                'Gender-neutral'],
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
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    },
});

Vue.component("product-review", {
    template: `
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
    <label for="choice">Would you recommend this product?:</label>
        <div>
            <input type="radio" id="yes" name="choice" v-model="choice" value="yes"/>
            <label for="yes">yes</label>
        </div>
        <div>
            <input type="radio" id="no" name="choice" v-model="choice" value="no" />
            <label for="no">no</label>
        </div>
    </p>
    <p>
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
            errors: [],
        };
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.choice) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    choice: this.choice,
                };
                eventBus.$emit("review-submitted", productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.choice = null;
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
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
              <p>Name: {{ review.name }}</p>
              <p>Rating: {{ review.rating }}</p>
              <p>Review:{{ review.review }}</p>
              <p>Choice: {{ review.choice }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
 
`,
    data() {
        return {
            tabs: ["Reviews", "Make a Review"],
            selectedTab: "Reviews",
        };
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