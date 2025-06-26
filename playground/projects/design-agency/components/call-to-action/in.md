Given the followin code snippet,
generate a stage configuration for the react component. The stage will be used in a component editor the represent the component in different situations.

Your response should be an array frame objects, each with the following properties:

- name: (optional) A descriptive name for the frame.
- size: "desktop" | "mobile" | "custom"
- width: (optional) Only required if size is "custom". The width of the frame. Can either be a number or "fit-content".
- height: (optional) Only required if size is "custom". The height of the frame Can either be a number or "fit-content".

## Guidelines

Read the component implementation to understand what it represents and based on common design practices, create frames that represent the component in different contexts.

Use "mobile"|"desktop" for page level components, and "custom" for smaller components like buttons, modals, cards, etc.
Use "fit-content" for width and height for the frame when the component already has an intrisic size, therefore the frame does not need to specify one. Use a number for width and height when the component needs to fill a specific space, such as a full-width button, cards that fill their container, etc.

For example:
Simple Button:

````json
[
  {
    "size": "custom",
    "width": "fit-content", // The button content likely has an intrinsic size, therefore the frame can simply fit the button.
    "height": "fit-content" // Button usually have fixed height, therefore the frame can simply fit the button.
  },
]

Fixed Width Button (eg: 120px wide):
```json
[
  {
    "size": "custom",
    "width": "fit-content", // The button already have a fixed width, therefore the frame can simply fit the button.
    "height": "fit-content"
  },
]

Full-Width Button:
```json
[
    {
      "size": "custom",
      "width": 300, // The button needs to fill something, therefore we give the frame a resonable fixed width.
      "height": "fit-content"
    },
]

Fixed Size Modal (eg: 600px wide, 400px tall):
```json
[
  {
    "size": "custom",
    "width": "fit-content", // The modal already have a fixed width, therefore the frame can simply fit the modal.
    "height": "fit-content" // The modal already have a fixed height, therefore the frame can simply fit the modal.
  },
]

Full-Width Modal:
```json
[
  {
    "size": "custom",
    "width": 800, // The modal needs to fill something, therefore we give the frame a resonable fixed width.
    "height": "fit-content" // The modal usually has a fixed height, therefore the frame can simply fit the modal.
  },
]

Pricing Section:
```json
[
  {
    "size": "desktop", // Page level component
  },
  {
    "size": "mobile", // Page level component
  },
]

Call to Action Section:
```json
[
  {
    "size": "desktop"
  },
  {
    "size": "mobile"
  },
]

About Page:
```json
[
  {
    "size": "desktop"
  },
  {
    "size": "mobile"
  },
]


```tsx
import React from "react";

const CallToAction: React.FC = () => {
  return (
    <section id="root">
      <div id="container">
        <div id="content">
          <h2 id="title">Ready to Start Your Project?</h2>
          <p id="description">
            Let's collaborate to bring your vision to life. Get in touch with us
            today and let's discuss how we can help you achieve your goals.
          </p>
          <div id="buttons">
            <a id="primary-button" href="/contact">
              Get Started
            </a>
            <a id="secondary-button" href="/portfolio">
              View Our Work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
````

```css
#root {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  padding: 5rem 0;
}

#container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

#title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ffffff, #e0e7ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

#description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  color: #d1d5db;
}

#buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

#primary-button {
  background: #6366f1;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

#primary-button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
}

#secondary-button {
  background: transparent;
  color: white;
  padding: 1rem 2rem;
  border: 2px solid #6b7280;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

#secondary-button:hover {
  border-color: #6366f1;
  background: #6366f1;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  #title {
    font-size: 2rem;
  }

  #description {
    font-size: 1.1rem;
  }

  #buttons {
    flex-direction: column;
    align-items: center;
  }

  #primary-button,
  #secondary-button {
    width: 100%;
    max-width: 300px;
  }
}
```
