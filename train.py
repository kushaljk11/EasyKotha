import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import psycopg2

# Connect to your PostgreSQL (same as Prisma)
conn = psycopg2.connect("YOUR_DATABASE_URL")

saved = pd.read_sql("""
SELECT "userId" as user_id, "postId" as post_id, 1 as score
FROM "_SavedPosts"
""", conn)

# Bookings (stronger)
bookings = pd.read_sql("""
SELECT "userId" as user_id, "postId" as post_id, 2 as score
FROM "Booking"
""", conn)

# Combine
df = pd.concat([saved, bookings], ignore_index=True)


matrix = df.pivot_table(
    index="user_id",
    columns="post_id",
    values="score",
    fill_value=0
)

similarity = cosine_similarity(matrix.T)

similarity_df = pd.DataFrame(
    similarity,
    index=matrix.columns,
    columns=matrix.columns
)

similarity_df.to_json("post_similarity.json")

print("✅ Training complete")