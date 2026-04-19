---
created: 2026-04-18 22:52:40
updated: 2026-04-19 02:33:12
---

This is the design document for a new photo library that will eventually be delivered via a new UIBUILDER node.

## Base requirements

- We should start by creating a stand-alone library that can be used in a Node.js microservice app and later in a UIBUILDER/Node-RED node.
- The library MUST be able to manage at least 45,000 image files, organized in around 4,000 folders, with a total data size of approximately 250GB.
- Processing MUST work effectively on limited server hardware, such as a Raspberry Pi or a low-end VPS.
- Processing MUST not adversely affect the performance of the server, as it will be running other critical services.
- It MUST utilise an existing folder structure of photos.
- Heavy/slow automation processes should be designed to run in the background, possibly in a worker thread or as a separate process, to avoid blocking the main application.
- Folder/file information should be stored in a database for fast searching and management, but the original folder structure should be preserved and remain the source of truth for file organization.
- DuckDB is the preferred database for managing metadata due to its performance advantages, especially for analytical queries, but SQLite can be used for managing app state and user preferences. DuckDB will be used for the "search index" - the catalogue photo files and their metadata, while SQLite can be used for "transactional" data that changes frequently in small increments (e.g., user settings, folder paths, album names, trash status).
- As the library develops, it should be remembered that the database table will need to expand its pre-defined columns to accommodate future AI-based features, such as face recognition and subject recognition (color, landscape type, etc.). This means that the database schema should be designed with flexibility in mind, allowing for the addition of new columns without significant performance degradation.

- The library SHOULD support fast searching and management of image metadata, including EXIF, IPTC, and XMP data.
- The library SHOULD be able to handle both embedded metadata and sidecar files.
- The library SHOULD be designed with future AI-based features in mind, such as face recognition and subject recognition (color, landscape type, etc.).
- The library SHOULD prioritize location-based metadata and support a hierarchical folder structure (e.g., Year > Month > Subject).
- The library SHOULD include a global map view and a mini map option for individual photo display, integrating with mapping libraries like Leaflet or Mapbox.

- Future enhancements MIGHT allow users to update metadata. This would need to allow EXIF/IPTC data to be written back to the original image files or sidecar files, while also updating the DuckDB index efficiently.


## Gemini input

> What are the strengths and advantages of using DuckDB with node.js microservice apps?

Using DuckDB within a Node.js microservice architecture transforms your service from a simple "data passer" into a powerful analytical engine. While SQLite is the go-to for transactional (OLTP) needs, DuckDB is essentially "SQLite for Analytics" (OLAP), offering several distinct advantages for modern microservices.

1. Zero-Infrastructure Analytics

    The primary advantage is the embedded nature of DuckDB. In a microservice environment, adding an analytical database usually means deploying a separate cluster (like Snowflake or BigQuery) and managing ETL pipelines.

    No Network Overhead: Since DuckDB runs inside your Node.js process, there are no network round-trips to a database server.

    Simplified Deployment: Your database is just another dependency in your package.json. There is no separate server to scale, patch, or secure.

2. High-Performance Columnar Execution

    Microservices often need to aggregate data (e.g., "Calculate the average response time for the last 10,000 requests"). Traditional row-based databases (PostgreSQL, SQLite) struggle with this because they read every column of every row.

    Vectorized Engine: DuckDB processes data in batches (vectors) rather than row-by-row, leveraging modern CPU features like SIMD (Single Instruction, Multiple Data).

    Columnar Storage: It only reads the specific columns required for a query. If you have a table with 50 columns but only need to sum one, DuckDB ignores the other 49 on disk.
    +1

3. Native File Interoperability
    DuckDB can treat external files like database tables without a formal "import" step. This is a game-changer for microservices that interact with Object Storage (S3, GCS).
    +1

    Direct Parquet/S3 Querying: A Node.js service can query a Parquet file sitting in an S3 bucket as if it were a local SQL table:

    ```SQL
    SELECT category, SUM(price) 
    FROM 's3://my-bucket/orders/*.parquet' 
    GROUP BY category;
    ```
    Memory Efficiency: It can stream data directly from these files, allowing a service with low RAM to analyze datasets much larger than its own memory.

    Comparison: SQLite vs. DuckDB for Node.js
    Feature | SQLite | DuckDB
    -- | -- | --
    Primary Use | Small writes, single-record lookups | Aggregations, joins, data analysis
    Storage Logic | Row-based (optimized for CRUD) | Columnar (optimized for MATH)
    Concurrency | Single writer, multiple readers | Parallelized query execution across cores
    External Data | Must import CSV/JSON first | Queries Parquet/CSV/JSON directly

4. Efficient Resource Utilization

    In a Kubernetes or containerized environment, DuckDB is highly efficient:

    Parallelism: Unlike SQLite, which is single-threaded for queries, DuckDB can utilize all available CPU cores of the container to speed up a single heavy query.

    Out-of-Core Processing: If a query requires more memory than the container has, DuckDB can "spill" to the container's local disk to prevent an Out-Of-Memory (OOM) crash.

5. Implementation in Node.js

    The duckdb package provides an API that is intentionally similar to the popular sqlite3 library, making it easy to adopt.

    ```JavaScript
    const duckdb = require('duckdb')
    const db = new duckdb.Database(':memory:') // In-memory for lightning speed

    db.all("SELECT * FROM 'data.parquet' WHERE price > 100", (err, res) => {
    if (err) throw err
        console.log(res)
    })
    ```
    When to use it?
    Analytical Endpoints: When your microservice needs to power a dashboard or provide "top 10" style reports.

    Edge Processing: When you need to process logs or telemetry data locally before sending summaries to a central warehouse.

    Data Transformation: When your service acts as a "transformer" that reads raw files and outputs cleaned datasets.

> Would you like to see a specific example of how to connect a Node.js DuckDB instance to an S3 bucket?
>
> > If I were creating a new photo library app using node.js, I would want to create a db of all image files with their extensible metadata (from in-file IPTC/EXIF and from XMP and other sidecar files) to enable faster searching and management. In that case, which would be a better fit, SQLite or DuckDB?

For a photo library application, DuckDB is the superior choice for the specific task of metadata searching and management, while SQLite remains the better choice if you need to manage user accounts, "favorite" toggles, or album naming (standard app state).

However, given that photo metadata is inherently structured for filtering and aggregation (e.g., "Find all photos taken with a 50mm lens in 2023"), DuckDB’s architectural strengths align perfectly with your goal.

### Why DuckDB Wins for Metadata Management

1. Columnar Searching vs. Row Scanning
    Photo metadata tables often become very "wide" (hundreds of columns for EXIF, IPTC, and XMP tags).

    The SQLite Approach: If you search for photos taken with a specific ISO, SQLite reads the entire row (including camera model, GPS, lens data, etc.) into memory just to check that one ISO value.

    The DuckDB Approach: DuckDB only reads the "ISO" column from the disk. This makes searching through 100,000+ images significantly faster, especially on constrained hardware.

2. Handling Semi-Structured Data (JSON & XMP)
    Metadata is messy. Some files have XMP sidecars; others have embedded IPTC.

    Flexible Types: DuckDB has excellent native support for JSON and MAP types. You can store raw XMP blobs as JSON and query nested fields with high performance.

    List Support: If you have tags (e.g., ["vacation", "beach", "sunset"]), DuckDB’s LIST type allows you to run complex set-based queries (like "photos containing all these tags") much more efficiently than SQLite’s string-searching or many-to-many join tables.

3. Massive "Bulk Load" Performance
    When first scanning a 500GB photo library, you need to insert tens of thousands of records quickly.

    Appender API: DuckDB’s Appender API is designed for high-speed bulk ingestion. It can ingest metadata from your Node.js scanner significantly faster than standard SQL INSERT statements in SQLite.

    Parquet Export: If you ever want to back up your library's index, DuckDB can export the entire database to a compressed Parquet file, which is much smaller than a standard SQL dump.

Comparison for a Photo App Context
Feature | SQLite | DuckDB
Search Speed | Slower for complex filters | Blazing fast for multi-attribute filters
Storage Size | Standard | Highly compressed (save disk space on the index)
Concurrency | Better for frequent small updates | Optimized for heavy read/analysis
Complexity | Extremely simple | Slightly higher (OLAP concepts)

### The "Hybrid" Recommendation
Many modern media apps use a dual-database strategy:

SQLite: Stores "Transaction" data. (User settings, folder paths, album names, trash status). This is data that changes frequently in small increments.

DuckDB: Stores the "Search Index." You sync your EXIF/XMP data into a DuckDB file. When the user opens the "Search" or "Map" view, Node.js queries DuckDB to get the list of image IDs.

### Implementation Tip for Node.js
Since you are using Node.js, you can use the duckdb library to create a persistent local file. To keep your search fast, remember to define your metadata columns explicitly rather than putting everything in a single JSON blob, as DuckDB performs best when it can isolate columns.

```javascript
const duckdb = require('duckdb')
const db = new duckdb.Database('photo_metadata.db')

// Use a separate table for the high-speed search index
db.run(`
  CREATE TABLE IF NOT EXISTS metadata (
    image_id UUID,
    capture_date TIMESTAMP,
    iso INTEGER,
    f_stop DOUBLE,
    tags VARCHAR[],
    camera_model VARCHAR
  )
`)
```

> How many images are you planning to manage in this library? Knowing the scale might help determine if the hybrid approach is necessary.
>
> > around 45,000 files over around 4,000 folders, around 250GB of data

With a library of 45,000 files, you are in a "sweet spot" where both databases will technically work, but their performance and storage characteristics will differ significantly as your library grows.

At this scale, DuckDB is the stronger choice for the specific goal of "faster searching and management" because of how it handles the wide, sparse metadata typical of image files (EXIF, IPTC, and XMP).

1. Performance: The "Wide Table" Advantage
    Photo metadata is notoriously wide—you might have 200+ possible fields (aperture, focal length, GPS, lens model, creator, copyright, etc.), but any single image only uses a fraction of them.

    SQLite (Row-based): To find all photos taken with a "Canon EOS R5," SQLite has to load the entire row for every image into memory. If each row is 2KB, scanning 45,000 images means reading ~90MB of data.

    DuckDB (Columnar): It only reads the camera_model column. Instead of 90MB, it might only read a few hundred KB. This makes "faceted search" (e.g., clicking a sidebar to filter by ISO, then by Lens, then by Date) feel instantaneous.

2. Storage Efficiency
    DuckDB uses advanced compression algorithms (like ZStd and Bit-packing) tailored for columnar data.

    Compression: Because metadata in columns is often repetitive (e.g., the same camera_model or software_version repeated thousands of times), DuckDB can compress this data much better than SQLite.

    Disk Footprint: For 45,000 records, a DuckDB file could be 50% to 80% smaller than an equivalent SQLite file.

3. Handling Sidecars and JSON
    Since you mentioned XMP and sidecar files, you likely have semi-structured data.

    Native JSON: DuckDB has a dedicated JSON type that is faster to query than SQLite's text-based JSON functions. You can ingest a whole XMP sidecar as a JSON blob and query it directly:

    ```SQL
    SELECT image_path 
    FROM metadata 
    WHERE xmp_data->>'$.dc:subject' CONTAINS 'Nature';
    ```
    Complex Types: DuckDB supports LIST and MAP types. This is perfect for image tags (keywords). Searching for "Photos with both 'Nature' AND 'Sunset' tags" is a native, high-performance operation in DuckDB.

    Comparison for 45,000 Images
    Metric | SQLite | DuckDB
    Initial Scan (Write) | Fast, but sensitive to individual inserts. | Blazing fast via "Appender" or bulk CSV/JSON import.
    Complex Search (Read) | Fast, but slows down as you add more metadata fields. | Stays extremely fast regardless of how many columns you add.
    Memory Usage | Very low. | Slightly higher (optimized for throughput).
    Tooling | DB Browser for SQLite is ubiquitous. | DBeaver, DuckDB CLI, or your own Node.js dashboard.

### My Recommendation: The Hybrid Path
Since you are building a full app, I recommend using DuckDB for the metadata index and keeping the app's structural state (like "Recently Viewed," "Custom Collections," or "User Preferences") in a simple JSON file or a small SQLite database.

Why? DuckDB is optimized for bulk reads and writes. If you update a single "Favorite" heart icon, DuckDB has to do more work than SQLite. But for searching through your 45,000 images by focal length? DuckDB will win every time.

### One Node.js Tip:
If you go with DuckDB, use the duckdb package and leverage Parquet files for your background exports. It makes your photo library's data portable and readable by any data science tool in the future.

```JavaScript
// Example: Querying your metadata for a specific lens
const duckdb = require('duckdb')
const db = new duckdb.Database('photos.db')

db.all("SELECT image_path FROM metadata WHERE lens_model = 'EF50mm f/1.8 STM'", (err, res) => {
  console.log(res)
})
```

> Does your photo library include a lot of custom tags or hierarchical keywords? That might change how we structure the schema.
>
> > Tags aren't as important as location. However, I would like eventually to add AI-based face recognition and other subject recognition (colour, landscape type, etc). But I don't want to ignore the basics either, existing folder structure is important. Most folders are organised by year and then sub-folder for month (e.g. 02 for Feb) and an optional subject. For example:
> >
> > ```
> > 2010
> >   01 - Jan
> >   02 - Feb
> >   02 - Birthday party
> >   ...
> > 2011
> >   ...
> > ...
> > ```

Given that you are prioritizing location and hierarchical folder structures, while planning for future AI-driven features (face/subject recognition), DuckDB is the clear winner for your Node.js app.

At 45,000 files, you aren't just building a database; you're building a "Feature Store." Here is how DuckDB handles your specific requirements better than SQLite.

1. Spatial Queries for Location
    Since location is your priority, you’ll likely be storing Latitude/Longitude coordinates.

    Aggregations: If you want to show a map with clusters (e.g., "Show me how many photos were taken in Paris vs. London"), DuckDB can perform these coordinate-based group-bys across your entire 45k dataset much faster than SQLite.

    Range Filters: Querying `WHERE lat BETWEEN 48.8 AND 48.9` is a native strength of the columnar format.

2. Handling the Hierarchical Folder Structure
    Your folder structure (Year > Month > Subject) is a form of metadata itself. In DuckDB, you can use Generated Columns to automatically parse your file paths.

    Virtual Columns: You can store the full path and have DuckDB automatically extract the Year and Month into their own virtual columns. This allows you to browse by "Folder" while technically querying a flat, high-performance table.

3. Future-Proofing for AI (Embeddings & Vectors)
    This is where DuckDB truly pulls ahead. AI face recognition and subject detection (like "landscape type") rely on Vector Embeddings—long arrays of numbers that represent the "essence" of an image.

    Fixed-Size Lists: DuckDB has a dedicated ARRAY type that is perfect for storing these AI embeddings.

    Search Complexity: When you eventually add face recognition, you’ll be doing "nearest neighbor" searches (finding vectors similar to a specific face). DuckDB is built to handle the math required for these multi-dimensional array comparisons far more efficiently than a standard relational database.

4. Color & Subject Analysis
    If you want to search by color (e.g., "Find all blue photos"), you’ll likely store a color histogram or a dominant hex code.

    Join Performance: As you add AI-generated subjects (e.g., "dog," "mountain," "red"), your database will grow in "width." DuckDB handles tables with hundreds of columns (Basics + AI + Location) without the performance degradation SQLite suffers when rows become too large.

### Recommended Schema Strategy
For your Node.js microservice, I suggest a single table in DuckDB structured like this:

Column | Type | Purpose
file_path | VARCHAR | The primary key/source of truth.
captured_at | TIMESTAMP | Extracted from EXIF/Folder name.
location | GEOMETRY | (Using the DuckDB Spatial extension).
folder_meta | JSON | Stores the "Subject" part of your folder name.
ai_embedding | FLOAT[512] | (Future) For face/subject recognition.

### Why this works for Node.js
Using the duckdb Node.js package, you can run "Window Functions" that are incredibly useful for photo apps—for example, automatically finding the "best" photo in a folder based on a combination of resolution and AI-scored "beauty" or "focus."

```JavaScript
// Example: Finding the top 5 'blue' photos in 2010
db.all(`
  SELECT file_path 
  FROM photos 
  WHERE year = 2010 
  ORDER BY color_score_blue DESC 
  LIMIT 5
`, (err, res) => {
  // res is returned as a clean JS array of objects
})
```

One thing to watch out for:

DuckDB is not great at frequent, single-row updates (e.g., changing the name of one photo every few seconds). If your app allows the user to constantly edit metadata one file at a time, ensure you "batch" those updates or use a small SQLite sidecar for "pending edits" before flushing them to the main DuckDB index.

Since location is key for you, are you planning on integrating a map view (like Leaflet or Mapbox) into the Node.js frontend?

Yes, an overall map view as well as a mini map option for an individual photo display will be incorporated.

Since you are incorporating both a global map view and individual mini-maps, DuckDB becomes an even stronger candidate because it allows you to handle geographic data as a first-class citizen using its Spatial Extension.

Here is how DuckDB will specifically power your map features and how to structure it in Node.js.

1. The Power of the Spatial Extension
    DuckDB isn't just for numbers; it can load a spatial module that understands GEOMETRY types. This is far more powerful than just storing lat and lng as floats in SQLite.

    Fast Bounding Box Queries: When a user pans your "Global Map," your Node.js service needs to find all photos within that specific window. DuckDB can use spatial indexing to return these results instantly, even if you eventually scale to 500,000 photos.

    Coordinate Extraction: If you have raw GPS data in your EXIF blobs, DuckDB can transform them into standard geometry points during the ingestion phase.

2. Implementation Strategy for Node.js
    To support your map views, you can structure your DuckDB integration to serve two distinct needs:

    A. The Global Map (Aggregated View)

    For the main map, you don't want to send 45,000 pins to the browser—it would crash the frontend. You want to send "clusters."
    DuckDB can perform ST_SnapToGrid or simple rounding to group photos by location in milliseconds.

    ```JavaScript
    // Example: Get photo counts grouped by roughly 1km grid squares for the map view
    const duckdb = require('duckdb')
    const db = new duckdb.Database('photos.db')

    db.all(`
    SELECT 
        round(latitude, 2) as lat_grid, 
        round(longitude, 2) as lng_grid, 
        count(*) as photo_count
    FROM photos
    WHERE year = 2024
    GROUP BY lat_grid, lng_grid
    `, (err, res) => {
    // 'res' is now a small array of clusters ready for Leaflet or Mapbox
    })
    ``` 

    B. The Individual Mini-Map
    
    For the individual photo view, you need the exact metadata. DuckDB’s columnar nature means that fetching the latitude, longitude, and location_name for a specific image_id is an incredibly "cheap" operation.

3. Handling Your Folder Hierarchy on the Map
    Since your folder structure (Year > Month > Subject) is important, you can create a "Map Filter" that mirrors your folders.

    The Query: "Show me all photos from the 'Birthday Party' folder on the map."

    The Benefit: In DuckDB, joining the folder path string with the GPS coordinates is faster than in SQLite because of how it handles string scanning.

4. Future-Proofing: AI + Location
    Imagine wanting to search: "Find all photos of 'Mountains' (AI) taken in 'Switzerland' (Location)."

    SQLite: This requires complex JOINs and likely slow scanning of the AI results.

    DuckDB: Because both the AI subject tags and the GPS coordinates are stored in optimized columns, this "multi-dimensional" search is exactly what the engine was built for.

### Recommended Node.js Setup
To ensure a smooth experience with your map and folder structure, use this pattern:

Ingestion: Use a Node.js worker thread to scan your 4,000 folders, extract EXIF/XMP via a library like exiftool-vendored, and use the DuckDB Appender API for bulk insertion.

Spatial Extension: Load the extension once at startup:

```JavaScript
db.run("INSTALL spatial; LOAD spatial")
```

The "Folder-to-Map" Link: Store your folder hierarchy as a VARCHAR array or a materialized path. DuckDB can then quickly filter by "Starts with '2010/02'" to show only those February 2010 photos on your map.

### Summary: Why DuckDB wins for your Maps
SQLite: Good at telling you where one photo is.

DuckDB: Great at telling you how 45,000 photos are distributed across the globe, while also being just as good at the individual lookup.

> Are you planning to use a specific mapping library like Leaflet, Mapbox, or OpenLayers for the frontend? Each has different ways of handling the "clustering" data DuckDB will provide.
