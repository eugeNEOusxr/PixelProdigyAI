// P2P networking for PixelProdigy blockchain

use std::sync::Arc;
use tokio::sync::RwLock;
use libp2p::{
    core::upgrade,
    gossipsub, identity, noise,
    swarm::{NetworkBehaviour, SwarmBuilder, SwarmEvent},
    tcp, yamux, PeerId, Swarm, Transport,
};

use crate::{Block, Transaction, Blockchain};

#[derive(NetworkBehaviour)]
pub struct ChainBehaviour {
    pub gossipsub: gossipsub::Behaviour,
}

pub struct NetworkNode {
    swarm: Swarm<ChainBehaviour>,
    chain: Arc<RwLock<Blockchain>>,
    peer_id: PeerId,
}

impl NetworkNode {
    pub async fn new(chain: Arc<RwLock<Blockchain>>) -> Result<Self, Box<dyn std::error::Error>> {
        // Generate identity
        let id_keys = identity::Keypair::generate_ed25519();
        let peer_id = PeerId::from(id_keys.public());

        // Create transport
        let transport = tcp::tokio::Transport::default()
            .upgrade(upgrade::Version::V1)
            .authenticate(noise::Config::new(&id_keys)?)
            .multiplex(yamux::Config::default())
            .boxed();

        // Configure gossipsub
        let gossipsub_config = gossipsub::ConfigBuilder::default()
            .heartbeat_interval(std::time::Duration::from_secs(10))
            .validation_mode(gossipsub::ValidationMode::Strict)
            .build()
            .expect("Valid config");

        let mut gossipsub = gossipsub::Behaviour::new(
            gossipsub::MessageAuthenticity::Signed(id_keys.clone()),
            gossipsub_config,
        )?;

        // Subscribe to topics
        let block_topic = gossipsub::IdentTopic::new("pixelchain-blocks");
        let tx_topic = gossipsub::IdentTopic::new("pixelchain-transactions");
        gossipsub.subscribe(&block_topic)?;
        gossipsub.subscribe(&tx_topic)?;

        let behaviour = ChainBehaviour { gossipsub };

        let swarm = SwarmBuilder::with_tokio_executor(transport, behaviour, peer_id).build();

        Ok(Self {
            swarm,
            chain,
            peer_id,
        })
    }

    pub fn peer_id(&self) -> &PeerId {
        &self.peer_id
    }

    /// Broadcast new block to network
    pub async fn broadcast_block(&mut self, block: &Block) -> Result<(), String> {
        let data = bincode::serialize(block).map_err(|e| e.to_string())?;
        let topic = gossipsub::IdentTopic::new("pixelchain-blocks");
        
        self.swarm
            .behaviour_mut()
            .gossipsub
            .publish(topic, data)
            .map_err(|e| e.to_string())?;
        
        Ok(())
    }

    /// Broadcast transaction to network
    pub async fn broadcast_transaction(&mut self, tx: &Transaction) -> Result<(), String> {
        let data = bincode::serialize(tx).map_err(|e| e.to_string())?;
        let topic = gossipsub::IdentTopic::new("pixelchain-transactions");
        
        self.swarm
            .behaviour_mut()
            .gossipsub
            .publish(topic, data)
            .map_err(|e| e.to_string())?;
        
        Ok(())
    }

    /// Listen on address
    pub async fn listen(&mut self, addr: &str) -> Result<(), Box<dyn std::error::Error>> {
        let multiaddr: libp2p::Multiaddr = addr.parse()?;
        self.swarm.listen_on(multiaddr)?;
        Ok(())
    }

    /// Connect to peer
    pub async fn dial(&mut self, addr: &str) -> Result<(), Box<dyn std::error::Error>> {
        let multiaddr: libp2p::Multiaddr = addr.parse()?;
        self.swarm.dial(multiaddr)?;
        Ok(())
    }

    /// Run event loop
    pub async fn run(&mut self) {
        loop {
            match self.swarm.select_next_some().await {
                SwarmEvent::Behaviour(event) => {
                    // Handle gossipsub events
                    println!("Network event: {:?}", event);
                }
                SwarmEvent::ConnectionEstablished { peer_id, .. } => {
                    println!("Connected to peer: {}", peer_id);
                }
                SwarmEvent::ConnectionClosed { peer_id, .. } => {
                    println!("Disconnected from peer: {}", peer_id);
                }
                _ => {}
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_node_creation() {
        let chain = Arc::new(RwLock::new(Blockchain::new()));
        let node = NetworkNode::new(chain).await;
        assert!(node.is_ok());
    }
}
