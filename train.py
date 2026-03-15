import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

df = pd.read_csv("dataset.csv")

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

print("Training complete")