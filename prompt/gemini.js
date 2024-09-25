const { SchemaType } = require("@google/generative-ai");

const handleGenderSchemaRenderImage = () => {
  const schema = {
    description: `List of photos information`,
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        location: {
          type: SchemaType.STRING,
          description:
            "Location in photos ( specifically in which city or country, if not a landscape photo then describe where it is )",
          nullable: false,
        },
        description: {
          type: SchemaType.STRING,
          description: "Short description of the photos",
          nullable: false,
        },
        capture: {
          type: SchemaType.STRING,
          description: `Capture of the photos, it should be a little long, can use icon`,
          nullable: false,
        },
      },
      required: ["location", "description", "capture"],
    },
  };

  return schema;
};

const handleGenderSchemaReadImage = () => {
  const schema = {
    description: `The information shown in the photo`,
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        value: {
          type: SchemaType.STRING,
          description: "The text information contained in the photo",
          nullable: false,
        },
        label: {
          type: SchemaType.STRING,
          description: "The label describing the value, you define these fields yourself",
          nullable: false,
        },
      },
      required: ["value", "label"],
    },
  };

  return schema;
};

const handleRenderManyDataFromImage = (customField) => {
    const schema = {
    description: `An array of objects representing various fields and their analyzed values`,
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        index: {
          type: SchemaType.STRING,
          description: "The order number of items, ascending",
          nullable: false,
        },
        items: {
          type: SchemaType.OBJECT,
          properties: {
            ...customField?.reduce((acc, item) => {
              acc[item.label] = {
                type: SchemaType.STRING,
                description: item.description,
                nullable: false,
              };
              return acc;
            }, {}),
          },
        }
      },
    },
  };

  return schema;
}

module.exports = {
    handleGenderSchemaRenderImage,
    handleGenderSchemaReadImage,
    handleRenderManyDataFromImage
};