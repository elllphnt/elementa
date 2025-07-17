export default function Landing() {
  return (
    <div css={{ "font-family": "Arial, sans-serif", "color": "#333" }}>
      <section
        css={{
          "background-image": "url('/images/restaurant-hero.jpg')",
          "background-size": "cover",
          "background-position": "center",
          "height": "80vh",
          "display": "flex",
          "flex-direction": "column",
          "justify-content": "center",
          "align-items": "center",
          "color": "white",
          "text-align": "center",
          "padding": "0 20px",
        }}
      >
        <h1
          css={{
            "font-size": "4rem",
            "margin": 0,
            "text-shadow": "2px 2px 4px rgba(0,0,0,0.7)",
          }}
        >
          Welcome to Our Restaurant
        </h1>
        <p
          css={{
            "font-size": "1.5rem",
            "margin-top": "1rem",
            "max-width": "600px",
            "text-shadow": "1px 1px 3px rgba(0,0,0,0.7)",
          }}
        >
          Experience the best flavors and ambiance
        </p>
      </section>

      <section
        css={{
          "padding": "40px 20px",
          "max-width": "900px",
          "margin": "0 auto",
        }}
      >
        <h2 css={{ "font-size": "2rem", "margin-bottom": "20px" }}>About Us</h2>
        <p>
          Our restaurant is dedicated to bringing you the freshest ingredients
          and authentic recipes that will delight your taste buds. Join us for a
          memorable dining experience.
        </p>
      </section>

      <section css={{ backgroundColor: "#f8f8f8", padding: "40px 20px" }}>
        <h2
          css={{
            "font-size": "2rem",
            "text-align": "center",
            "margin-bottom": "30px",
          }}
        >
          Menu Highlights
        </h2>
        <div
          css={{
            "display": "flex",
            "justify-content": "space-around",
            "flex-wrap": "wrap",
            "gap": "20px",
            "max-width": "900px",
            "margin": "0 auto",
          }}
        >
          <div
            css={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              flex: "1 1 250px",
            }}
          >
            <h3>Grilled Salmon</h3>
            <p>Fresh salmon grilled to perfection with a lemon butter sauce.</p>
          </div>
          <div
            css={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              flex: "1 1 250px",
            }}
          >
            <h3>Classic Caesar Salad</h3>
            <p>
              Crisp romaine lettuce with homemade Caesar dressing and croutons.
            </p>
          </div>
          <div
            css={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              flex: "1 1 250px",
            }}
          >
            <h3>Chocolate Lava Cake</h3>
            <p>
              Decadent chocolate cake with a molten center and vanilla ice
              cream.
            </p>
          </div>
        </div>
      </section>

      <section
        css={{
          "padding": "40px 20px",
          "max-width": "900px",
          "margin": "0 auto",
        }}
      >
        <h2 css={{ "font-size": "2rem", "margin-bottom": "20px" }}>
          Contact Us
        </h2>
        <p>
          Address: 123 Foodie Lane, Flavor Town
          <br />
          Phone: (123) 456-7890
          <br />
          Email: contact@restaurant.com
        </p>
      </section>
    </div>
  );
}
