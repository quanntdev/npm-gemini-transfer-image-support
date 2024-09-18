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

module.exports = {
    handleGenderSchemaRenderImage
};