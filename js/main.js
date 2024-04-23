Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
<div class="product">
<div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
<!--            <a :href="link">More products like this.</a>-->
            <p v-if="inStock">In stock</p>
            <p :class="{ productInfoOutOfStock: !inStock }" v-else>Out of Stock</p>
            <span v-if="sale">On Sale</span>
            <span v-else>Not On Sale</span>
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
            <p>Shipping: {{ shipping }}</p>
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
        
    <div>
        <h2>Reviews</h2>
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
            <li v-for="review in reviews">
                <p>{{ review.name }} </p>
                <p>Rating: {{ review.rating }}</p>
                <p>{{ review.review }}</p>
            </li>
        </ul>
    </div>
        <div>
<!--        <product-tabs :reviews="reviews"></product-tabs>-->
            <product-review @review-submitted="addReview"></product-review>
            
        </div>
                
</div>

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
    methods: {

        addToCart() {
            this.$emit('add-to-cart',
                this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        },
    }


});

Vue.component('product-review', {
    template: `
<form class="review-form" @submit.prevent="onSubmit">
<p>


<label for="name">Name:</label>
<input id="name" v-model="name" placeholder="name" required>
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
<input type="submit" value="Submit" required>
</p>

<p v-if="errors.length">
<b>Please correct the following error(s):</b>
<ul>
<li v-for="error in errors">{{ error }}</li>
</ul>
</p>
</form>

`,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                }
                this.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
            }
        }

    }
});

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
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
<p>{{ review.name }}</p>
<p>Rating: {{ review.rating }}</p>
<p>{{ review.review }}</p>
</li>
</ul>
</div>
<div v-show="selectedTab === 'Make a Review'">
<product-review
@review-submitted="addReview"></product-review>
</div>
</div>
`,
    data() {
        return {

            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})
let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
        // reviews: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        // addReview(productReview) {
        //     this.reviews.push(productReview)
        // }
    }

})
