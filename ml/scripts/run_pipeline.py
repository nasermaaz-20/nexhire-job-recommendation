"""
Run all ML pipelines (content-based + collaborative).
"""

from pipelines.content_based import ContentBasedPipeline
from pipelines.collaborative_user import CollaborativeUserPipeline
from pipelines.collaborative_company import CollaborativeCompanyPipeline


def main():
  print("=" * 60)
  print("Starting ML Pipelines")
  print("=" * 60)

  print("\n[1/3] Content-Based Pipeline")
  print("-" * 40)
  ContentBasedPipeline().run()

  print("\n[2/3] Collaborative User→Job Pipeline")
  print("-" * 40)
  CollaborativeUserPipeline().run()

  print("\n[3/3] Collaborative Job→User Pipeline")
  print("-" * 40)
  CollaborativeCompanyPipeline().run()

  print("\n" + "=" * 60)
  print("All pipelines completed successfully.")
  print("=" * 60)


if __name__ == "__main__":
  main()

