import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Float "mo:base/Float";

actor {
  type Project = {
    id: Nat;
    creator: Principal;
    title: Text;
    description: Text;
    goal: Float;
    raised: Float;
    contributors: [(Principal, Float)];
    withdrawn: Bool;
  };

  stable var projects : [Project] = [];
  stable var nextId : Nat = 0;

  public query func listProjects() : async [Project] {
    projects
  };

  public query func getProject(id: Nat) : async ?Project {
    projects.find(p => p.id == id)
  };

  public shared({caller}) func createProject(title: Text, description: Text, goal: Float) : async Nat {
    let project : Project = {
      id = nextId;
      creator = caller;
      title = title;
      description = description;
      goal = goal;
      raised = 0.0;
      contributors = [];
      withdrawn = false;
    };
    projects := Array.append(projects, [project]);
    nextId += 1;
    project.id
  };

  public shared({caller}) func fundProject(id: Nat, amount: Float) : async Bool {
    let idx = projects.indexWhere(p => p.id == id);
    if (idx == null) return false;
    let i = idx!;
    let p = projects[i];
    if (p.withdrawn) return false;
    let updatedContributors =
      switch (p.contributors.findIndex(c => c.0 == caller)) {
        case null { Array.append(p.contributors, [(caller, amount)]) };
        case (?ci) {
          let mut arr = p.contributors;
          arr[ci] := (caller, arr[ci].1 + amount);
          arr
        }
      };
    let updated = {
      id = p.id;
      creator = p.creator;
      title = p.title;
      description = p.description;
      goal = p.goal;
      raised = p.raised + amount;
      contributors = updatedContributors;
      withdrawn = p.withdrawn;
    };
    projects[i] := updated;
    true
  };

  public shared({caller}) func withdrawFunds(id: Nat) : async Bool {
    let idx = projects.indexWhere(p => p.id == id);
    if (idx == null) return false;
    let i = idx!;
    let p = projects[i];
    if (p.creator != caller) return false;
    if (p.raised < p.goal) return false;
    if (p.withdrawn) return false;
    // TODO: Transfer logic (handled by ICP ledger or Candid interface)
    let updated = {
      id = p.id;
      creator = p.creator;
      title = p.title;
      description = p.description;
      goal = p.goal;
      raised = p.raised;
      contributors = p.contributors;
      withdrawn = true;
    };
    projects[i] := updated;
    true
  };
}