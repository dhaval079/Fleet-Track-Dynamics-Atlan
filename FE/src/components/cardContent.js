// src/components/ui/cardContent.js


export const CardContent = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

// src/components/ui/cardHeader.js


export const CardHeader = ({ children }) => {
  return <div className="border-b pb-2">{children}</div>;
};

// src/components/ui/cardTitle.js


export const CardTitle = ({ children }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>;
};

// src/components/ui/cardDescription.js


export const CardDescription = ({ children }) => {
  return <p className="text-sm text-gray-600">{children}</p>;
};

// src/components/ui/cardFooter.js


export const CardFooter = ({ children }) => {
  return <div className="border-t pt-2">{children}</div>;
};
